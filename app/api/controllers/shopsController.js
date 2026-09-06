import { Shop, ExitVoucher, ExitVoucherItem, Product } from '../models.old/index.js';
import { logAudit } from '../middleware/audit.js';

export async function getShops(req, res) {
  try {
    const shops = await Shop.findAll({
      order: [['name', 'ASC']]
    });
    return res.json(shops);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du chargement des shops.' });
  }
}

export async function getShopById(req, res) {
  try {
    const { id } = req.params;
    const shop = await Shop.findByPk(id, {
      include: [
        {
          model: ExitVoucher,
          as: 'exitVouchers',
          include: [
            {
              model: ExitVoucherItem,
              as: 'items',
              include: [{ model: Product, as: 'product' }]
            }
          ],
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!shop) return res.status(404).json({ error: 'Shop non trouvé.' });

    return res.json(shop);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function createShop(req, res) {
  try {
    const { name, code, managerName, location, phone } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Nom et Code du shop obligatoires.' });
    }

    const shop = await Shop.create({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      managerName,
      location,
      phone
    });

    await logAudit({
      req,
      action: 'CREATION_SHOP',
      entityType: 'Shop',
      entityId: shop.id,
      details: `Création du shop partenaire/point de vente ${shop.name} (${shop.code})`
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Erreur lors de la création du shop.' });
  }
}

export async function updateShop(req, res) {
  try {
    const { id } = req.params;
    const { name, managerName, location, phone, active } = req.body;

    const shop = await Shop.findByPk(id);
    if (!shop) return res.status(404).json({ error: 'Shop non trouvé.' });

    if (name) shop.name = name;
    if (managerName !== undefined) shop.managerName = managerName;
    if (location !== undefined) shop.location = location;
    if (phone !== undefined) shop.phone = phone;
    if (active !== undefined) shop.active = active;

    await shop.save();

    await logAudit({
      req,
      action: 'MODIF_SHOP',
      entityType: 'Shop',
      entityId: shop.id,
      details: `Modification des informations du shop ${shop.name}`
    });

    return res.json(shop);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
}
