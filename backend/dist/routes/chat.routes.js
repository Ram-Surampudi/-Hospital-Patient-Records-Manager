"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/conversations', auth_1.authenticateToken, chat_controller_1.chatController.getConversations);
router.get('/messages', auth_1.authenticateToken, chat_controller_1.chatController.getMessages);
router.post('/messages', auth_1.authenticateToken, chat_controller_1.chatController.sendMessage);
exports.default = router;
