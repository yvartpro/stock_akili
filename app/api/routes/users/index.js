import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.js';
import usersController from '../../controllers/usersController.js';

const router = Router();

router.get('/', verifyToken, requireRole(['admin']), usersController.getUsers.bind(usersController));
router.post('/', verifyToken, requireRole(['admin']), usersController.createUser.bind(usersController));
router.put('/:id', verifyToken, requireRole(['admin']), usersController.updateUser.bind(usersController));

export default router;
