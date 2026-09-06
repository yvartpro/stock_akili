import { logAudit } from '../middleware/audit.js';
import * as Models from '../models/index.js';

const { Brand, PhoneModel, Color } = Models;

class CategoriesController {
  async getBrands(req, res) {
    try {
      const brands = await Brand.findAll({
        include: [{ model: PhoneModel, as: 'models' }],
        order: [['name', 'ASC']]
      });
      return res.json(brands);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors du chargement des marques.' });
    }
  }

  async createBrand(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Nom de la marque requis.' });

      const brand = await Brand.create({ name: name.trim() });
      await logAudit({
        req,
        action: 'CREATION_MARQUE',
        entityType: 'Brand',
        entityId: brand.id,
        details: `Création de la marque ${brand.name}`
      });

      return res.status(201).json(brand);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Erreur lors de la création de la marque.' });
    }
  }

  async createModel(req, res) {
    try {
      const { name, brandId } = req.body;
      if (!name || !brandId) {
        return res.status(400).json({ error: 'Nom et marque obligatoires.' });
      }

      const model = await PhoneModel.create({ name: name.trim(), brandId });
      await logAudit({
        req,
        action: 'CREATION_MODELE',
        entityType: 'PhoneModel',
        entityId: model.id,
        details: `Création du modèle ${model.name}`
      });

      return res.status(201).json(model);
    } catch (error) {
      return res.status(400).json({ error: 'Erreur lors de la création du modèle.' });
    }
  }

  async getColors(req, res) {
    try {
      const colors = await Color.findAll({ order: [['name', 'ASC']] });
      return res.json(colors);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors du chargement des couleurs.' });
    }
  }

  async createColor(req, res) {
    try {
      const { name, hexCode } = req.body;
      if (!name) return res.status(400).json({ error: 'Nom de la couleur requis.' });

      const color = await Color.create({
        name: name.trim(),
        hexCode: hexCode || '#475569'
      });

      await logAudit({
        req,
        action: 'CREATION_COULEUR',
        entityType: 'Color',
        entityId: color.id,
        details: `Création de la couleur ${color.name}`
      });

      return res.status(201).json(color);
    } catch (error) {
      return res.status(400).json({ error: 'Erreur lors de la création de la couleur.' });
    }
  }
}

const categoriesController = new CategoriesController();
export default categoriesController;
