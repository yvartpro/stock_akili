import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.js';
import authController from '../../controllers/authController.js';

const router = Router();

router.post('/login', authController.login.bind(authController));
router.get('/me', verifyToken, authController.getMe.bind(authController));
router.post('/logout', verifyToken, authController.logout.bind(authController));

export default router;
