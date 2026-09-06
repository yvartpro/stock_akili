import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import inventoriesController from '../../controllers/inventoriesController.js';

const router = Router();

router.get('/', verifyToken, inventoriesController.getInventories.bind(inventoriesController));
router.get('/prepare', verifyToken, inventoriesController.prepareInventory.bind(inventoriesController));
router.get('/:id', verifyToken, inventoriesController.getInventoryById.bind(inventoriesController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), inventoriesController.createInventory.bind(inventoriesController));
router.post('/:id/adjust', verifyToken, requireRole(['admin', 'gestionnaire']), inventoriesController.applyInventoryAdjustments.bind(inventoriesController));

export default router;
