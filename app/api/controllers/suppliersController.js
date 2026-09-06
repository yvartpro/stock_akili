import * as Models from '../models/index.js';
import { logAudit } from '../middleware/audit.js';

const { Supplier, Reception, ReceptionItem, Product } = Models;

export async function getSuppliers(req, res) {
  try {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });
    return res.json(suppliers);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du chargement des fournisseurs.' });
  }
}

export async function getSupplierById(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: Reception,
          as: 'receptions',
          include: [
            {
              model: ReceptionItem,
              as: 'items',
              include: [{ model: Product, as: 'product' }]
            }
          ],
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Fournisseur non trouvé.' });
    }

    return res.json(supplier);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}

export async function createSupplier(req, res) {
  try {
    const { name, code, contactName, phone, email, address, notes } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Nom et Code fournisseur obligatoires.' });
    }

    const supplier = await Supplier.create({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      contactName,
      phone,
      email,
      address,
      notes
    });

    await logAudit({
      req,
      action: 'CREATION_FOURNISSEUR',
      entityType: 'Supplier',
      entityId: supplier.id,
      details: `Création du fournisseur ${supplier.name} (${supplier.code})`
    });

    return res.status(201).json(supplier);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Erreur lors de la création du fournisseur.' });
  }
}

export async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const { name, contactName, phone, email, address, notes, active } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé.' });

    if (name) supplier.name = name;
    if (contactName !== undefined) supplier.contactName = contactName;
    if (phone !== undefined) supplier.phone = phone;
    if (email !== undefined) supplier.email = email;
    if (address !== undefined) supplier.address = address;
    if (notes !== undefined) supplier.notes = notes;
    if (active !== undefined) supplier.active = active;

    await supplier.save();

    await logAudit({
      req,
      action: 'MODIF_FOURNISSEUR',
      entityType: 'Supplier',
      entityId: supplier.id,
      details: `Modification des informations du fournisseur ${supplier.name}`
    });

    return res.json(supplier);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
}
