import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import categoriesController from '../../controllers/categoriesController.js';

const router = Router();

router.get('/brands', verifyToken, categoriesController.getBrands.bind(categoriesController));
router.post('/brands', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createBrand.bind(categoriesController));
router.post('/models', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createModel.bind(categoriesController));
router.get('/colors', verifyToken, categoriesController.getColors.bind(categoriesController));
router.post('/colors', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createColor.bind(categoriesController));

export default router;
