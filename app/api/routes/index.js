import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as productsController from '../controllers/productsController.js';
import * as categoriesController from '../controllers/categoriesController.js';
import * as suppliersController from '../controllers/suppliersController.js';
import * as shopsController from '../controllers/shopsController.js';
import * as receptionsController from '../controllers/receptionsController.js';
import * as exitVouchersController from '../controllers/exitVouchersController.js';
import * as inventoriesController from '../controllers/inventoriesController.js';
import * as damagedController from '../controllers/damagedController.js';
import * as reportsController from '../controllers/reportsController.js';
import * as auditController from '../controllers/auditController.js';
import * as usersController from '../controllers/usersController.js';

const router = Router();

// 1. Auth routes (public login, protected me & logout)
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.getMe);
router.post('/auth/logout', verifyToken, authController.logout);

// 2. Products
router.get('/products', verifyToken, productsController.getProducts);
router.get('/products/alerts', verifyToken, productsController.getAlerts);
router.get('/products/:id', verifyToken, productsController.getProductById);
router.post('/products', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.createProduct);
router.put('/products/:id', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.updateProduct);
router.patch('/products/:id/status', verifyToken, requireRole(['admin', 'gestionnaire']), productsController.updateProductStatus);

// 3. Brands, Models, Colors
router.get('/categories/brands', verifyToken, categoriesController.getBrands);
router.post('/categories/brands', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createBrand);
router.post('/categories/models', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createModel);
router.get('/categories/colors', verifyToken, categoriesController.getColors);
router.post('/categories/colors', verifyToken, requireRole(['admin', 'gestionnaire']), categoriesController.createColor);

// 4. Suppliers (Fournisseurs)
router.get('/suppliers', verifyToken, suppliersController.getSuppliers);
router.get('/suppliers/:id', verifyToken, suppliersController.getSupplierById);
router.post('/suppliers', verifyToken, requireRole(['admin', 'gestionnaire']), suppliersController.createSupplier);
router.put('/suppliers/:id', verifyToken, requireRole(['admin', 'gestionnaire']), suppliersController.updateSupplier);

// 5. Shops (Points de vente passifs)
router.get('/shops', verifyToken, shopsController.getShops);
router.get('/shops/:id', verifyToken, shopsController.getShopById);
router.post('/shops', verifyToken, requireRole(['admin', 'gestionnaire']), shopsController.createShop);
router.put('/shops/:id', verifyToken, requireRole(['admin', 'gestionnaire']), shopsController.updateShop);

// 6. Receptions (Entrées)
router.get('/receptions', verifyToken, receptionsController.getReceptions);
router.get('/receptions/:id', verifyToken, receptionsController.getReceptionById);
router.post('/receptions', verifyToken, requireRole(['admin', 'gestionnaire']), receptionsController.createReception);

// 7. Exit Vouchers (Bons de sortie)
router.get('/exit-vouchers', verifyToken, exitVouchersController.getExitVouchers);
router.get('/exit-vouchers/:id', verifyToken, exitVouchersController.getExitVoucherById);
router.post('/exit-vouchers', verifyToken, requireRole(['admin', 'gestionnaire']), exitVouchersController.createExitVoucher);

// 8. Inventories (Inventaires périodiques & écarts)
router.get('/inventories', verifyToken, inventoriesController.getInventories);
router.get('/inventories/prepare', verifyToken, inventoriesController.prepareInventory);
router.get('/inventories/:id', verifyToken, inventoriesController.getInventoryById);
router.post('/inventories', verifyToken, requireRole(['admin', 'gestionnaire']), inventoriesController.createInventory);
router.post('/inventories/:id/adjust', verifyToken, requireRole(['admin', 'gestionnaire']), inventoriesController.applyInventoryAdjustments);

// 9. Damaged / Lost / Out of Service Products (Section 11)
router.get('/damaged', verifyToken, damagedController.getDamagedProducts);
router.post('/damaged', verifyToken, requireRole(['admin', 'gestionnaire']), damagedController.declareDamaged);

// 10. Reports & Movements
router.get('/reports/dashboard', verifyToken, reportsController.getDashboardStats);
router.get('/reports/movements', verifyToken, reportsController.getStockMovements);

// 11. Audit Logs (Admin only per Cahier des charges)
router.get('/audit', verifyToken, requireRole(['admin']), auditController.getAuditLogs);

// 12. Users & Roles (Admin only per Cahier des charges)
router.get('/users', verifyToken, requireRole(['admin']), usersController.getUsers);
router.post('/users', verifyToken, requireRole(['admin']), usersController.createUser);
router.put('/users/:id', verifyToken, requireRole(['admin']), usersController.updateUser);

export default router;
