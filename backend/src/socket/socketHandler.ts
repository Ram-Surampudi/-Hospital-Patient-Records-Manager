import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join user's personal room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }
    
    socket.on('join_chat', (data: { userId: string }) => {
      socket.join(`chat_${data.userId}`);
      console.log(`User ${socket.userId} joined chat with ${data.userId}`);
    });
    
    socket.on('send_message', async (data: {
      receiverId: string;
      content: string;
      patientId?: string;
      type?: string;
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('message_error', { error: 'User not authenticated' });
          return;
        }

        // Create the message
        const message = await prisma.message.create({
          data: {
            content: data.content,
            type: data.type || 'text',
            senderId: socket.userId,
            receiverId: data.receiverId,
            patientId: data.patientId || null,
          },
        });
        
        // Get sender details
        const sender = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: { id: true, name: true, role: true },
        });
        
        // Get receiver details
        const receiver = await prisma.user.findUnique({
          where: { id: data.receiverId },
          select: { id: true, name: true, role: true },
        });
        
        // Create message object with user details
        const messageWithUsers = {
          ...message,
          sender,
          receiver,
        };
        
        // Emit to sender
        io.to(`user_${socket.userId}`).emit('message_sent', messageWithUsers);
        
        // Emit to receiver
        io.to(`user_${data.receiverId}`).emit('new_message', messageWithUsers);
        
        // If patient chat, emit to patient room
        if (data.patientId) {
          io.to(`patient_${data.patientId}`).emit('patient_message', messageWithUsers);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });
    
    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
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