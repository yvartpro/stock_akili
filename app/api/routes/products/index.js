import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import productsController from '../../controllers/productsController.js';

const router = Router();

router.get('/', verifyToken, productsController.getProducts.bind(productsController));
router.get('/alerts', verifyToken, productsController.getAlerts.bind(productsController));
router.get('/:id', verifyToken, productsController.getProductById.bind(productsController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.createProduct.bind(productsController));
router.put('/:id', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.updateProduct.bind(productsController));
router.patch('/:id/status', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.updateProductStatus.bind(productsController));

export default router;
