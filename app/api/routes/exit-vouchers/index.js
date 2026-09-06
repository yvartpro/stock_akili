import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import exitVouchersController from '../../controllers/exitVouchersController.js';

const router = Router();

router.get('/', verifyToken, exitVouchersController.getExitVouchers.bind(exitVouchersController));
router.get('/:id', verifyToken, exitVouchersController.getExitVoucherById.bind(exitVouchersController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), exitVouchersController.createExitVoucher.bind(exitVouchersController));

export default router;
