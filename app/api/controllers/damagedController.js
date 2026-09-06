import * as Models from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const { Product, Brand, PhoneModel, Color, StockMovement, DamagedRecord, User } = Models;

class DamagedController {
  async getDamagedProducts(req, res) {
    try {
      const records = await DamagedRecord.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              { model: Brand, as: 'brand' },
              { model: PhoneModel, as: 'phoneModel' },
              { model: Color, as: 'color' }
            ]
          },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const legacyProducts = await Product.findAll({
        where: {
          status: ['endommage', 'perdu', 'hors_service']
        },
        include: [
          { model: Brand, as: 'brand' },
          { model: PhoneModel, as: 'phoneModel' },
          { model: Color, as: 'color' }
        ]
      });

      const legacyMapped = legacyProducts.map(p => ({
        id: `legacy-${p.id}`,
        productId: p.id,
        product: p,
        status: p.status,
        quantity: p.currentStock || 1,
        reason: p.statusReason || 'Article déclaré défectueux / endommagé',
        date: p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        user: { name: 'Gestionnaire Stock' },
        createdAt: p.updatedAt
      }));

      return res.json([...records, ...legacyMapped]);
    } catch (error) {
      console.error('getDamagedProducts error:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des articles endommagés/perdus.' });
    }
  }

  async declareDamaged(req, res) {
    try {
      const { productId, status, reason, quantity } = req.body;

      const allowed = ['endommage', 'perdu', 'hors_service'];
      if (!status || !allowed.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide (valeurs autorisées: endommage, perdu, hors_service).' });
      }

      if (!reason || reason.trim() === '') {
        return res.status(400).json({ error: 'Le motif / justification est obligatoire pour déclarer un article endommagé ou perdu.' });
      }

      const product = await Product.findByPk(productId, {
        include: [
          { model: Brand, as: 'brand' },
          { model: PhoneModel, as: 'phoneModel' },
          { model: Color, as: 'color' }
        ]
      });

      if (!product) {
        return res.status(404).json({ error: 'Produit introuvable.' });
      }

      const qty = parseInt(quantity, 10) || 1;
      if (qty <= 0) {
        return res.status(400).json({ error: 'La quantité déclarée doit être au moins de 1 unité.' });
      }

      if (qty > product.currentStock) {
        return res.status(400).json({
          error: `Stock insuffisant : vous souhaitez déclarer ${qty} unité(s), mais le stock actuel disponible est de ${product.currentStock}.`
        });
      }

      const prevStock = product.currentStock;
      product.currentStock = prevStock - qty;
      product.statusReason = `${product.statusReason ? product.statusReason + ' | ' : ''}${qty}x déclaré(s) ${status}: ${reason.trim()}`;
      await product.save();

      const damagedRecord = await DamagedRecord.create({
        productId: product.id,
        status,
        quantity: qty,
        reason: reason.trim(),
        date: new Date().toISOString().split('T')[0],
        userId: req.user.id
      });

      await StockMovement.create({
        productId: product.id,
        type: 'CHANGEMENT_STATUT',
        reference: `ANOMALIE-${status.toUpperCase()}-${damagedRecord.id}`,
        quantityChange: -qty,
        previousStock: prevStock,
        newStock: product.currentStock,
        userId: req.user.id,
        reason: `Déclaration anomalie [${status}]: ${reason.trim()} (${qty} unités)`
      });

      await logAudit({
        req,
        action: 'DECLARATION_ANOMALIE_STOCK',
        entityType: 'Product',
        entityId: product.id,
        details: `Article ${product.sku} déclaré [${status}]. Quantité: ${qty}, Motif: ${reason.trim()}`
      });

      const populatedRecord = await DamagedRecord.findByPk(damagedRecord.id, {
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              { model: Brand, as: 'brand' },
              { model: PhoneModel, as: 'phoneModel' },
              { model: Color, as: 'color' }
            ]
          },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });

      return res.status(201).json({
        message: `Anomalie déclarée avec succès (${qty} unité(s) sorties du stock disponible).`,
        record: populatedRecord,
        product
      });
    } catch (error) {
      console.error('declareDamaged error:', error);
      return res.status(500).json({ error: error.message || 'Erreur lors de la déclaration de casse/perte.' });
    }
  }
}

const damagedController = new DamagedController();
export default damagedController;

