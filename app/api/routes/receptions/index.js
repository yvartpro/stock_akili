import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import receptionsController from '../../controllers/receptionsController.js';

const router = Router();

router.get('/', verifyToken, receptionsController.getReceptions.bind(receptionsController));
router.get('/:id', verifyToken, receptionsController.getReceptionById.bind(receptionsController));
router.post('/', verifyToken, requireRole(['admin', 'gestionnaire']), receptionsController.createReception.bind(receptionsController));

export default router;
