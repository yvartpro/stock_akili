import { sequelize } from '../models/index.js';
import * as Models from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const { Reception, ReceptionItem, Product, Supplier, User, Brand, PhoneModel, Color, StockMovement } = Models;

class ReceptionsController {
  async getReceptions(req, res) {
    try {
      const receptions = await Reception.findAll({
        include: [
          { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'code'] },
          { model: User, as: 'user', attributes: ['id', 'name'] },
          {
            model: ReceptionItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [
                  { model: Brand, as: 'brand' },
                  { model: PhoneModel, as: 'phoneModel' },
                  { model: Color, as: 'color' }
                ]
              }
            ]
          }
        ],
        order: [['date', 'DESC'], ['id', 'DESC']]
      });

      return res.json(receptions);
    } catch (error) {
      console.error('getReceptions error:', error);
      return res.status(500).json({ error: 'Erreur lors du chargement des réceptions.' });
    }
  }

  async getReceptionById(req, res) {
    try {
      const { id } = req.params;
      const reception = await Reception.findByPk(id, {
        include: [
          { model: Supplier, as: 'supplier' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          {
            model: ReceptionItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [
                  { model: Brand, as: 'brand' },
                  { model: PhoneModel, as: 'phoneModel' },
                  { model: Color, as: 'color' }
                ]
              }
            ]
          }
        ]
      });

      if (!reception) return res.status(404).json({ error: 'Réception non trouvée.' });

      return res.json(reception);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  async createReception(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { supplierId, date, time, totalCartons, observation, items } = req.body;

      if (!supplierId) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Le fournisseur est obligatoire pour toute réception.' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Veuillez ajouter au moins un produit à la réception.' });
      }

      const currentYear = new Date().getFullYear();
      const count = await Reception.count();
      const receptionNumber = `REC-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      const reception = await Reception.create({
        receptionNumber,
        date: date || new Date().toISOString().split('T')[0],
        time: time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        supplierId,
        userId: req.user.id,
        totalCartons: Number(totalCartons) || 1,
        observation,
        status: 'validee'
      }, { transaction });

      for (const item of items) {
        const qty = parseInt(item.quantityReceived, 10);
        if (isNaN(qty) || qty <= 0) {
          await transaction.rollback();
          return res.status(400).json({ error: 'Quantité invalide pour l\'un des articles.' });
        }

        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ error: `Produit ID ${item.productId} introuvable.` });
        }

        const previousStock = product.currentStock;
        const newStock = previousStock + qty;

        product.currentStock = newStock;
        if (item.unitCost) {
          product.unitCost = Number(item.unitCost);
        }
        await product.save({ transaction });

        await ReceptionItem.create({
          receptionId: reception.id,
          productId: product.id,
          quantityReceived: qty,
          cartonsCount: Number(item.cartonsCount) || 1,
          unitCost: Number(item.unitCost) || product.unitCost
        }, { transaction });

        await StockMovement.create({
          productId: product.id,
          type: 'ENTREE_RECEPTION',
          reference: receptionNumber,
          quantityChange: qty,
          previousStock,
          newStock,
          userId: req.user.id,
          reason: `Réception de marchandises ${receptionNumber}`
        }, { transaction });
      }

      await transaction.commit();

      await logAudit({
        req,
        action: 'RECEPTION_VALIDEE',
        entityType: 'Reception',
        entityId: reception.id,
        details: `Réception ${receptionNumber} enregistrée avec ${items.length} lignes de produits (${totalCartons} cartons).`
      });

      const fullReception = await Reception.findByPk(reception.id, {
        include: [
          { model: Supplier, as: 'supplier' },
          { model: User, as: 'user' },
          { model: ReceptionItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ]
      });

      return res.status(201).json(fullReception);
    } catch (error) {
      await transaction.rollback();
      console.error('createReception error:', error);
      return res.status(500).json({ error: error.message || 'Erreur lors de la validation de la réception.' });
    }
  }
}

const receptionsController = new ReceptionsController();
export default receptionsController;
