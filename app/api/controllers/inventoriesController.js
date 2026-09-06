import { sequelize } from '../models/index.js';
import * as Models from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const { Inventory, InventoryItem, Product, User, Brand, PhoneModel, Color, StockMovement } = Models;

export async function getInventories(req, res) {
  try {
    const inventories = await Inventory.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        {
          model: InventoryItem,
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

    return res.json(inventories);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du chargement des inventaires.' });
  }
}

export async function getInventoryById(req, res) {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: InventoryItem,
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

    if (!inventory) return res.status(404).json({ error: 'Inventaire non trouvé.' });

    return res.json(inventory);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// Prepare an inventory session prefilled with theoretical stocks of all active products
export async function prepareInventory(req, res) {
  try {
    const products = await Product.findAll({
      where: { status: 'disponible' },
      include: [
        { model: Brand, as: 'brand' },
        { model: PhoneModel, as: 'phoneModel' },
        { model: Color, as: 'color' }
      ],
      order: [['name', 'ASC']]
    });

    return res.json(products.map(p => ({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      brand: p.brand?.name,
      phoneModel: p.phoneModel?.name,
      color: p.color?.name,
      protectionType: p.protectionType,
      theoreticalStock: p.currentStock,
      physicalStock: p.currentStock, // default suggested
      difference: 0,
      justification: ''
    })));
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la préparation de l\'inventaire.' });
  }
}

// Create an inventory snapshot
export async function createInventory(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { date, observation, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Aucun produit renseigné dans la fiche d\'inventaire.' });
    }

    // Check mandatory justification rule: In case of discrepancy, justification is MANDATORY
    for (const item of items) {
      const diff = Number(item.physicalStock) - Number(item.theoreticalStock);
      if (diff !== 0 && (!item.justification || item.justification.trim() === '')) {
        await transaction.rollback();
        const prod = await Product.findByPk(item.productId);
        return res.status(400).json({
          error: `Justification obligatoire pour le produit "${prod ? prod.name : 'SKU ' + item.productId}" car un écart de ${diff > 0 ? '+' : ''}${diff} unité(s) a été constaté.`
        });
      }
    }

    const currentYear = new Date().getFullYear();
    const count = await Inventory.count();
    const inventoryNumber = `INV-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const inventory = await Inventory.create({
      inventoryNumber,
      date: date || new Date().toISOString().split('T')[0],
      userId: req.user.id,
      status: 'en_cours',
      observation
    }, { transaction });

    for (const item of items) {
      const theo = Number(item.theoreticalStock);
      const phys = Number(item.physicalStock);
      const diff = phys - theo;

      await InventoryItem.create({
        inventoryId: inventory.id,
        productId: item.productId,
        theoreticalStock: theo,
        physicalStock: phys,
        difference: diff,
        justification: item.justification ? item.justification.trim() : null,
        adjustmentApplied: false
      }, { transaction });
    }

    await transaction.commit();

    await logAudit({
      req,
      action: 'INVENTAIRE_ENREGISTRE',
      entityType: 'Inventory',
      entityId: inventory.id,
      details: `Inventaire périodique ${inventoryNumber} créé (${items.length} références comptées). En attente de validation des ajustements.`
    });

    const fullInventory = await Inventory.findByPk(inventory.id, {
      include: [
        { model: User, as: 'user' },
        { 
          model: InventoryItem, 
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    return res.status(201).json(fullInventory);
  } catch (error) {
    await transaction.rollback();
    console.error('createInventory error:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l\'enregistrement de l\'inventaire.' });
  }
}

// Validate inventory discrepancies and adjust stock (Section 9 & 10)
export async function applyInventoryAdjustments(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const inventory = await Inventory.findByPk(id, {
      include: [{ model: InventoryItem, as: 'items' }],
      transaction
    });

    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Inventaire introuvable.' });
    }

    if (inventory.status === 'valide') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cet inventaire a déjà été validé et régularisé.' });
    }

    let adjustedCount = 0;

    for (const item of inventory.items) {
      if (item.difference !== 0 && !item.adjustmentApplied) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (product) {
          const previousStock = product.currentStock;
          const newStock = item.physicalStock;

          // Prevent negative stock
          if (newStock < 0) {
            await transaction.rollback();
            return res.status(400).json({ error: `Le stock résultant pour ${product.name} ne peut pas être négatif.` });
          }

          product.currentStock = newStock;
          await product.save({ transaction });

          item.adjustmentApplied = true;
          await item.save({ transaction });

          adjustedCount++;

          await StockMovement.create({
            productId: product.id,
            type: 'AJUSTEMENT_INVENTAIRE',
            reference: inventory.inventoryNumber,
            quantityChange: item.difference,
            previousStock,
            newStock,
            userId: req.user.id,
            reason: `Ajustement suite inventaire ${inventory.inventoryNumber}. Justification: ${item.justification || 'Régularisation inventaire physique'}`
          }, { transaction });
        }
      }
    }

    inventory.status = 'valide';
    await inventory.save({ transaction });

    await transaction.commit();

    await logAudit({
      req,
      action: 'AJUSTEMENT_STOCK_INVENTAIRE',
      entityType: 'Inventory',
      entityId: inventory.id,
      details: `Validation et régularisation des écarts pour ${inventory.inventoryNumber} (${adjustedCount} produits ajustés en stock)`
    });

    return res.json({ 
      message: 'Inventaire validé et stocks ajustés avec succès.',
      adjustedCount 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('applyInventoryAdjustments error:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de la validation des ajustements.' });
  }
}
