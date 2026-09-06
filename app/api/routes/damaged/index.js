import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import damagedController from '../../controllers/damagedController.js';

const router = Router();

router.get('/', verifyToken, damagedController.getDamagedProducts.bind(damagedController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), damagedController.declareDamaged.bind(damagedController));

export default router;
