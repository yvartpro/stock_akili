import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.js';
import reportsController from '../../controllers/reportsController.js';

const router = Router();

router.get('/dashboard', verifyToken, reportsController.getDashboardStats.bind(reportsController));
router.get('/movements', verifyToken, reportsController.getStockMovements.bind(reportsController));

export default router;
