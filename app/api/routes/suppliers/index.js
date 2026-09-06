import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import suppliersController from '../../controllers/suppliersController.js';

const router = Router();

router.get('/', verifyToken, suppliersController.getSuppliers.bind(suppliersController));
router.get('/:id', verifyToken, suppliersController.getSupplierById.bind(suppliersController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), suppliersController.createSupplier.bind(suppliersController));
router.put('/:id', verifyToken, requireRole(['admin', 'gestionnaire']), suppliersController.updateSupplier.bind(suppliersController));

export default router;
