"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const setupSocketHandlers = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;
            next();
        }
        catch (err) {
            console.error('Socket authentication error:', err);
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);
        // Join user's personal room
        if (socket.userId) {
            socket.join(`user_${socket.userId}`);
        }
        socket.on('join_chat', (data) => {
            socket.join(`chat_${data.userId}`);
            console.log(`User ${socket.userId} joined chat with ${data.userId}`);
        });
        socket.on('send_message', async (data) => {
            try {
                if (!socket.userId) {
                    socket.emit('message_error', { error: 'User not authenticated' });
                    return;
                }
                const message = await index_1.prisma.message.create({
                    data: {
                        content: data.content,
                        type: data.type || 'text',
                        senderId: socket.userId,
                        receiverId: data.receiverId,
                        patientId: data.patientId || null,
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
                // Emit to sender
                io.to(`user_${socket.userId}`).emit('message_sent', message);
                // Emit to receiver
                io.to(`user_${data.receiverId}`).emit('new_message', message);
                // If patient chat, emit to patient room
                if (data.patientId) {
                    io.to(`patient_${data.patientId}`).emit('patient_message', message);
                }
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });
        socket.on('typing', (data) => {
            io.to(`user_${data.receiverId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping: data.isTyping,
            });
        });
        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
