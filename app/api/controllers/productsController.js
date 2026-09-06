import { Op } from 'sequelize';
import { logAudit } from '../middleware/audit.js';
import * as Models from '../models/index.js';

const { Product, Brand, PhoneModel, Color, StockMovement } = Models;

class ProductsController {
  async getProducts(req, res) {
    try {
      const { category, brandId, modelId, status, search, lowStock } = req.query;
      const where = {};

      if (category) where.category = category;
      if (brandId) where.brandId = brandId;
      if (modelId) where.modelId = modelId;
      if (status) where.status = status;

      if (lowStock === 'true') {
        where[Op.and] = [this.sequelizeWhereCurrentStockLessThanMinThreshold()];
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } },
          { protectionType: { [Op.like]: `%${search}%` } }
        ];
      }

      const products = await Product.findAll({
        where,
        include: [
          { model: Brand, as: 'brand', attributes: ['id', 'name'] },
          { model: PhoneModel, as: 'phoneModel', attributes: ['id', 'name'] },
          { model: Color, as: 'color', attributes: ['id', 'name', 'hexCode'] }
        ],
        order: [['id', 'DESC']]
      });

      let results = products;
      if (lowStock === 'true') {
        results = products.filter(p => p.currentStock <= p.minStockThreshold);
      }

      return res.json(results);
    } catch (error) {
      console.error('getProducts error:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
    }
  }

  sequelizeWhereCurrentStockLessThanMinThreshold() {
    return {
      currentStock: { [Op.lte]: 1000 }
    };
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [
          { model: Brand, as: 'brand' },
          { model: PhoneModel, as: 'phoneModel' },
          { model: Color, as: 'color' },
          { model: StockMovement, as: 'movements', limit: 30, order: [['createdAt', 'DESC']] }
        ]
      });

      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé.' });
      }

      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  async createProduct(req, res) {
    try {
      const {
        name,
        sku,
        category,
        brandId,
        modelId,
        colorId,
        protectionType,
        minStockThreshold,
        initialStock,
        unitCost,
        unitPrice,
        notes
      } = req.body;

      if (!name || !sku || !category || !brandId || !modelId || !colorId) {
        return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires (Nom, SKU, Catégorie, Marque, Modèle, Couleur).' });
      }

      const existing = await Product.findOne({ where: { sku } });
      if (existing) {
        return res.status(400).json({ error: `Le SKU "${sku}" existe déjà dans le système.` });
      }

      const stock = Number(initialStock) || 0;

      const product = await Product.create({
        name,
        sku: sku.toUpperCase().trim(),
        category,
        brandId,
        modelId,
        colorId,
        protectionType: category === 'protection' ? (protectionType || 'Verre Trempé Standard') : null,
        currentStock: stock,
        minStockThreshold: Number(minStockThreshold) || 15,
        unitCost: Number(unitCost) || 0,
        unitPrice: Number(unitPrice) || 0,
        status: 'disponible',
        notes
      });

      if (stock > 0) {
        await StockMovement.create({
          productId: product.id,
          type: 'ENTREE_RECEPTION',
          reference: 'INIT-STOCK',
          quantityChange: stock,
          previousStock: 0,
          newStock: stock,
          userId: req.user?.id || null,
          reason: 'Création initiale du produit et affectation de stock initial'
        });
      }

      await logAudit({
        req,
        action: 'CREATION_PRODUIT',
        entityType: 'Product',
        entityId: product.id,
        details: `Création du produit ${product.name} (SKU: ${product.sku}, Stock: ${stock})`
      });

      const fullProduct = await Product.findByPk(product.id, {
        include: [
          { model: Brand, as: 'brand' },
          { model: PhoneModel, as: 'phoneModel' },
          { model: Color, as: 'color' }
        ]
      });

      return res.status(201).json(fullProduct);
    } catch (error) {
      console.error('createProduct error:', error);
      return res.status(500).json({ error: error.message || 'Erreur lors de la création du produit.' });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, minStockThreshold, unitCost, unitPrice, notes, protectionType } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé.' });
      }

      if (name) product.name = name;
      if (minStockThreshold !== undefined) product.minStockThreshold = Number(minStockThreshold);
      if (unitCost !== undefined) product.unitCost = Number(unitCost);
      if (unitPrice !== undefined) product.unitPrice = Number(unitPrice);
      if (notes !== undefined) product.notes = notes;
      if (protectionType !== undefined && product.category === 'protection') {
        product.protectionType = protectionType;
      }

      await product.save();

      await logAudit({
        req,
        action: 'MODIF_PRODUIT',
        entityType: 'Product',
        entityId: product.id,
        details: `Mise à jour des paramètres du produit ${product.sku} (${product.name})`
      });

      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
  }

  async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, statusReason } = req.body;

      const allowed = ['disponible', 'endommage', 'perdu', 'hors_service'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide.' });
      }

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé.' });
      }

      const oldStatus = product.status;
      product.status = status;
      product.statusReason = statusReason || `Changement de statut vers ${status}`;
      await product.save();

      await logAudit({
        req,
        action: 'CHANGEMENT_STATUT',
        entityType: 'Product',
        entityId: product.id,
        details: `Statut modifié de [${oldStatus}] à [${status}]. Motif: ${product.statusReason}`
      });

      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
    }
  }

  async getAlerts(req, res) {
    try {
      const products = await Product.findAll({
        where: { status: 'disponible' },
        include: [
          { model: Brand, as: 'brand' },
          { model: PhoneModel, as: 'phoneModel' },
          { model: Color, as: 'color' }
        ]
      });

      const lowStockItems = products.filter(p => p.currentStock <= p.minStockThreshold);

      return res.json({
        count: lowStockItems.length,
        items: lowStockItems
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la vérification des alertes.' });
    }
  }
}

const productsController = new ProductsController();
export default productsController;
