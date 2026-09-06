import { sequelize } from '../models/index.js';
import * as Models from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const { ExitVoucher, ExitVoucherItem, Product, Shop, User, Brand, PhoneModel, Color, StockMovement } = Models;

class ExitVouchersController {
  async getExitVouchers(req, res) {
    try {
      const vouchers = await ExitVoucher.findAll({
        include: [
          { model: Shop, as: 'shop', attributes: ['id', 'name', 'code', 'location'] },
          { model: User, as: 'user', attributes: ['id', 'name'] },
          {
            model: ExitVoucherItem,
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

      return res.json(vouchers);
    } catch (error) {
      console.error('getExitVouchers error:', error);
      return res.status(500).json({ error: 'Erreur lors du chargement des bons de sortie.' });
    }
  }

  async getExitVoucherById(req, res) {
    try {
      const { id } = req.params;
      const voucher = await ExitVoucher.findByPk(id, {
        include: [
          { model: Shop, as: 'shop' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          {
            model: ExitVoucherItem,
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

      if (!voucher) return res.status(404).json({ error: 'Bon de sortie non trouvé.' });

      return res.json(voucher);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
  }

  async createExitVoucher(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { shopId, date, time, observation, items } = req.body;

      if (!shopId) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Veuillez sélectionner le Shop destinataire.' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Veuillez ajouter au moins un produit au bon de sortie.' });
      }

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          await transaction.rollback();
          return res.status(400).json({ error: 'Toutes les quantités sorties doivent être supérieures à zéro.' });
        }

        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ error: `Produit ID ${item.productId} introuvable.` });
        }

        if (product.status !== 'disponible') {
          await transaction.rollback();
          return res.status(400).json({
            error: `Le produit "${product.name}" (${product.sku}) n'est pas disponible (Statut actuel: ${product.status}). Impossible de l'expédier.`
          });
        }

        if (qty > product.currentStock) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Stock insuffisant pour "${product.name}" (${product.sku}). Demandé: ${qty}, Disponible en stock: ${product.currentStock}. La sortie ne peut excéder le stock disponible.`
          });
        }
      }

      const currentYear = new Date().getFullYear();
      const count = await ExitVoucher.count();
      const voucherNumber = `BS-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      const exitVoucher = await ExitVoucher.create({
        voucherNumber,
        date: date || new Date().toISOString().split('T')[0],
        time: time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        shopId,
        userId: req.user.id,
        observation,
        status: 'valide'
      }, { transaction });

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        const product = await Product.findByPk(item.productId, { transaction });

        const previousStock = product.currentStock;
        const newStock = previousStock - qty;

        product.currentStock = newStock;
        await product.save({ transaction });

        await ExitVoucherItem.create({
          exitVoucherId: exitVoucher.id,
          productId: product.id,
          quantity: qty
        }, { transaction });

        await StockMovement.create({
          productId: product.id,
          type: 'SORTIE_SHOP',
          reference: voucherNumber,
          quantityChange: -qty,
          previousStock,
          newStock,
          userId: req.user.id,
          reason: `Sortie de stock vers Shop (Bon ${voucherNumber})`
        }, { transaction });
      }

      await transaction.commit();

      const shop = await Shop.findByPk(shopId);

      await logAudit({
        req,
        action: 'BON_SORTIE_VALIDE',
        entityType: 'ExitVoucher',
        entityId: exitVoucher.id,
        details: `Bon de sortie ${voucherNumber} émis vers ${shop ? shop.name : 'Shop ' + shopId} (${items.length} références expédiées).`
      });

      const fullVoucher = await ExitVoucher.findByPk(exitVoucher.id, {
        include: [
          { model: Shop, as: 'shop' },
          { model: User, as: 'user' },
          {
            model: ExitVoucherItem,
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

      return res.status(201).json(fullVoucher);
    } catch (error) {
      await transaction.rollback();
      console.error('createExitVoucher error:', error);
      return res.status(500).json({ error: error.message || 'Erreur lors de la création du bon de sortie.' });
    }
  }
}

const exitVouchersController = new ExitVouchersController();
export default exitVouchersController;
