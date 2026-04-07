import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', authController.login);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);

export default router;