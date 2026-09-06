import * as Models from '../models/index.js';

const { Product, Brand, PhoneModel, Color, Shop, ExitVoucher, ExitVoucherItem, Reception, ReceptionItem, StockMovement } = Models;
export async function getDashboardStats(req, res) {
  try {
    const products = await Product.findAll({
      include: [
        { model: Brand, as: 'brand' },
        { model: PhoneModel, as: 'phoneModel' },
        { model: Color, as: 'color' }
      ]
    });

    let totalUnits = 0;
    let totalStockCostValue = 0;
    let totalStockWholesaleValue = 0;
    let pochettesUnits = 0;
    let protectionsUnits = 0;
    const lowStockAlerts = [];
    const damagedUnits = [];

    products.forEach(p => {
      if (p.status === 'disponible') {
        totalUnits += p.currentStock;
        totalStockCostValue += (p.currentStock * (p.unitCost || 0));
        totalStockWholesaleValue += (p.currentStock * (p.unitPrice || 0));

        if (p.category === 'pochette') pochettesUnits += p.currentStock;
        if (p.category === 'protection') protectionsUnits += p.currentStock;

        if (p.currentStock <= p.minStockThreshold) {
          lowStockAlerts.push(p);
        }
      } else {
        damagedUnits.push(p);
      }
    });

    // Recent 10 stock movements
    const recentMovements = await StockMovement.findAll({
      limit: 15,
      order: [['createdAt', 'DESC']],
      include: [{ model: Product, as: 'product', include: [{ model: Brand, as: 'brand' }, { model: PhoneModel, as: 'phoneModel' }] }]
    });

    // Count receptions and vouchers
    const totalReceptions = await Reception.count();
    const totalExitVouchers = await ExitVoucher.count();

    // Outgoing totals by shop
    const shops = await Shop.findAll({
      include: [
        {
          model: ExitVoucher,
          as: 'exitVouchers',
          include: [{ model: ExitVoucherItem, as: 'items' }]
        }
      ]
    });

    const shopStats = shops.map(s => {
      let unitsDispatched = 0;
      let vouchersCount = s.exitVouchers ? s.exitVouchers.length : 0;
      if (s.exitVouchers) {
        s.exitVouchers.forEach(v => {
          if (v.items) {
            v.items.forEach(it => {
              unitsDispatched += it.quantity;
            });
          }
        });
      }
      return {
        id: s.id,
        name: s.name,
        code: s.code,
        location: s.location,
        vouchersCount,
        unitsDispatched
      };
    }).sort((a, b) => b.unitsDispatched - a.unitsDispatched);

    return res.json({
      summary: {
        totalSkus: products.length,
        totalUnits,
        totalStockCostValue: Number(totalStockCostValue.toFixed(2)),
        totalStockWholesaleValue: Number(totalStockWholesaleValue.toFixed(2)),
        lowStockCount: lowStockAlerts.length,
        damagedCount: damagedUnits.length,
        totalReceptions,
        totalExitVouchers,
        pochettesUnits,
        protectionsUnits
      },
      lowStockAlerts,
      recentMovements,
      shopStats
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' });
  }
}

export async function getStockMovements(req, res) {
  try {
    const { type, limit = 50 } = req.query;
    const where = {};
    if (type) where.type = type;

    const movements = await StockMovement.findAll({
      where,
      limit: parseInt(limit, 10),
      order: [['createdAt', 'DESC']],
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
    });

    return res.json(movements);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des mouvements.' });
  }
}
