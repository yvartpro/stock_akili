import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import shopsController from '../../controllers/shopsController.js';

const router = Router();

router.get('/', verifyToken, shopsController.getShops.bind(shopsController));
router.get('/:id', verifyToken, shopsController.getShopById.bind(shopsController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), shopsController.createShop.bind(shopsController));
router.put('/:id', verifyToken, requireRole(['admin', 'gestionnaire']), shopsController.updateShop.bind(shopsController));

export default router;
