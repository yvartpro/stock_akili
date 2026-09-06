import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import authController from '../controllers/authController.js';
import productsController from '../controllers/productsController.js';
import categoriesController from '../controllers/categoriesController.js';
import suppliersController from '../controllers/suppliersController.js';
import shopsController from '../controllers/shopsController.js';
import receptionsController from '../controllers/receptionsController.js';
import exitVouchersController from '../controllers/exitVouchersController.js';
import inventoriesController from '../controllers/inventoriesController.js';
import damagedController from '../controllers/damagedController.js';
import reportsController from '../controllers/reportsController.js';
import auditController from '../controllers/auditController.js';
import usersController from '../controllers/usersController.js';

const router = Router();

router.post('/auth/login', authController.login.bind(authController));
router.get('/auth/me', verifyToken, authController.getMe.bind(authController));
router.post('/auth/logout', verifyToken, authController.logout.bind(authController));

router.get('/products', verifyToken, productsController.getProducts.bind(productsController));
router.get('/products/alerts', verifyToken, productsController.getAlerts.bind(productsController));
router.get('/products/:id', verifyToken, productsController.getProductById.bind(productsController));
router.post('/products', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.createProduct.bind(productsController));
router.put('/products/:id', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.updateProduct.bind(productsController));
router.patch('/products/:id/status', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.updateProductStatus.bind(productsController));

router.get('/categories/brands', verifyToken, categoriesController.getBrands.bind(categoriesController));
router.post('/categories/brands', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createBrand.bind(categoriesController));
router.post('/categories/models', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createModel.bind(categoriesController));
router.get('/categories/colors', verifyToken, categoriesController.getColors.bind(categoriesController));
router.post('/categories/colors', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createColor.bind(categoriesController));

router.get('/suppliers', verifyToken, suppliersController.getSuppliers.bind(suppliersController));
router.get('/suppliers/:id', verifyToken, suppliersController.getSupplierById.bind(suppliersController));
router.post('/suppliers', verifyToken, requireRole(['admin', 'gestionnaire']), suppliersController.createSupplier.bind(suppliersController));
router.put('/suppliers/:id', verifyToken, requireRole(['admin', 'gestionnaire']), suppliersController.updateSupplier.bind(suppliersController));

router.get('/shops', verifyToken, shopsController.getShops.bind(shopsController));
router.get('/shops/:id', verifyToken, shopsController.getShopById.bind(shopsController));
router.post('/shops', verifyToken, requireRole(['admin', 'gestionnaire']), shopsController.createShop.bind(shopsController));
router.put('/shops/:id', verifyToken, requireRole(['admin', 'gestionnaire']), shopsController.updateShop.bind(shopsController));

router.get('/receptions', verifyToken, receptionsController.getReceptions.bind(receptionsController));
router.get('/receptions/:id', verifyToken, receptionsController.getReceptionById.bind(receptionsController));
router.post('/receptions', verifyToken, requireRole(['admin', 'gestionnaire']), receptionsController.createReception.bind(receptionsController));

router.get('/exit-vouchers', verifyToken, exitVouchersController.getExitVouchers.bind(exitVouchersController));
router.get('/exit-vouchers/:id', verifyToken, exitVouchersController.getExitVoucherById.bind(exitVouchersController));
router.post('/exit-vouchers', verifyToken, requireRole(['admin', 'gestionnaire']), exitVouchersController.createExitVoucher.bind(exitVouchersController));

router.get('/inventories', verifyToken, inventoriesController.getInventories.bind(inventoriesController));
router.get('/inventories/prepare', verifyToken, inventoriesController.prepareInventory.bind(inventoriesController));
router.get('/inventories/:id', verifyToken, inventoriesController.getInventoryById.bind(inventoriesController));
router.post('/inventories', verifyToken, requireRole(['admin', 'gestionnaire']), inventoriesController.createInventory.bind(inventoriesController));
router.post('/inventories/:id/adjust', verifyToken, requireRole(['admin', 'gestionnaire']), inventoriesController.applyInventoryAdjustments.bind(inventoriesController));

router.get('/damaged', verifyToken, damagedController.getDamagedProducts.bind(damagedController));
router.post('/damaged', verifyToken, requireRole(['admin', 'gestionnaire']), damagedController.declareDamaged.bind(damagedController));

router.get('/reports/dashboard', verifyToken, reportsController.getDashboardStats.bind(reportsController));
router.get('/reports/movements', verifyToken, reportsController.getStockMovements.bind(reportsController));

router.get('/audit', verifyToken, requireRole(['admin']), auditController.getAuditLogs.bind(auditController));

router.get('/users', verifyToken, requireRole(['admin']), usersController.getUsers.bind(usersController));
router.post('/users', verifyToken, requireRole(['admin']), usersController.createUser.bind(usersController));
router.put('/users/:id', verifyToken, requireRole(['admin']), usersController.updateUser.bind(usersController));

export default router;
