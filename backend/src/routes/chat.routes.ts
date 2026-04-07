import express from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/conversations', authenticateToken, chatController.getConversations);
router.get('/messages', authenticateToken, chatController.getMessages);
router.post('/messages', authenticateToken, chatController.sendMessage);

export default router;