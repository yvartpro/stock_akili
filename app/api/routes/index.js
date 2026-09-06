import { Router } from 'express';
import authRoutes from './auth/index.js';
import productsRoutes from './products/index.js';
import categoriesRoutes from './categories/index.js';
import suppliersRoutes from './suppliers/index.js';
import shopsRoutes from './shops/index.js';
import receptionsRoutes from './receptions/index.js';
import exitVouchersRoutes from './exit-vouchers/index.js';
import inventoriesRoutes from './inventories/index.js';
import damagedRoutes from './damaged/index.js';
import reportsRoutes from './reports/index.js';
import auditRoutes from './audit/index.js';
import usersRoutes from './users/index.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/shops', shopsRoutes);
router.use('/receptions', receptionsRoutes);
router.use('/exit-vouchers', exitVouchersRoutes);
router.use('/inventories', inventoriesRoutes);
router.use('/damaged', damagedRoutes);
router.use('/reports', reportsRoutes);
router.use('/audit', auditRoutes);
router.use('/users', usersRoutes);

export default router;
