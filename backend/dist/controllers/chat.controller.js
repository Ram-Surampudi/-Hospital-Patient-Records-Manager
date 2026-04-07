"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const index_1 = require("../index");
exports.chatController = {
    async getConversations(req, res) {
        try {
            const conversations = await index_1.prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: req.user.id },
                        { receiverId: req.user.id },
                    ],
                },
                include: {
                    sender: {
                        select: { id: true, name: true, role: true },
                    },
                    receiver: {
                        select: { id: true, name: true, role: true },
                    },
                    patient: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            // Process conversations to get unique ones
            const conversationMap = new Map();
            conversations.forEach(msg => {
                const otherUserId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
                if (!conversationMap.has(otherUserId)) {
                    conversationMap.set(otherUserId, {
                        userId: otherUserId,
                        userName: msg.senderId === req.user.id ? msg.receiver.name : msg.sender.name,
                        userRole: msg.senderId === req.user.id ? msg.receiver.role : msg.sender.role,
                        lastMessage: msg.content,
                        lastMessageTime: msg.createdAt,
                        unreadCount: msg.receiverId === req.user.id && !msg.isRead ? 1 : 0,
                    });
                }
            });
            res.json(Array.from(conversationMap.values()));
        }
        catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({ message: 'Error fetching conversations' });
        }
    },
    async getMessages(req, res) {
        try {
            const { userId, patientId } = req.query;
            const where = {
                OR: [
                    { senderId: req.user.id, receiverId: userId },
                    { senderId: userId, receiverId: req.user.id },
                ],
            };
            if (patientId) {
                where.patientId = patientId;
            }
            const messages = await index_1.prisma.message.findMany({
                where,
                include: {
                    sender: {
                        select: { id: true, name: true, role: true },
                    },
                    receiver: {
                        select: { id: true, name: true, role: true },
                    },
                },
                orderBy: { createdAt: 'asc' },
            });
            // Mark messages as read
            await index_1.prisma.message.updateMany({
                where: {
                    receiverId: req.user.id,
                    senderId: userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            res.json(messages);
        }
        catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ message: 'Error fetching messages' });
        }
    },
    async sendMessage(req, res) {
        try {
            const { receiverId, content, patientId, type } = req.body;
            const message = await index_1.prisma.message.create({
                data: {
                    content,
                    type: type || 'text',
                    senderId: req.user.id,
                    receiverId: receiverId,
                    patientId: patientId || null,
                },
                include: {
                    sender: {
                        select: { id: true, name: true, role: true },
                    },
                    receiver: {
                        select: { id: true, name: true, role: true },
                    },
                },
            });
            res.status(201).json(message);
        }
        catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ message: 'Error sending message' });
        }
    },
};
