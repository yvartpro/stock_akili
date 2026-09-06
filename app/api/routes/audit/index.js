import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import auditController from '../../controllers/auditController.js';

const router = Router();

router.get('/', verifyToken, requireRole(['admin']), auditController.getAuditLogs.bind(auditController));

export default router;
