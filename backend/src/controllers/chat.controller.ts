import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const chatController = {
  async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get all messages involving the current user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Get unique user IDs from messages
      const userIds = new Set<string>();
      for (const message of messages) {
        if (message.senderId !== userId) userIds.add(message.senderId);
        if (message.receiverId !== userId) userIds.add(message.receiverId);
      }
      
      // If no conversations, get users based on role hierarchy
      if (userIds.size === 0) {
        let usersToShow: any[] = [];
        
        if (userRole === 'superadmin') {
          usersToShow = await prisma.user.findMany({
            where: { role: 'admin', isActive: true },
            select: { id: true, name: true, role: true },
          });
        } else if (userRole === 'admin') {
          const doctors = await prisma.user.findMany({
            where: { role: 'doctor', isActive: true },
            select: { id: true, name: true, role: true },
          });
          const superadmins = await prisma.user.findMany({
            where: { role: 'superadmin', isActive: true },
            select: { id: true, name: true, role: true },
          });
          usersToShow = [...superadmins, ...doctors];
        } else if (userRole === 'doctor') {
          const doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: userId },
          });
          
          const assignments = await prisma.assignedPatient.findMany({
            where: { doctorId: doctorProfile?.id },
          });
          
          const patientIds = assignments.map(a => a.patientId);
          const patients = await prisma.patient.findMany({
            where: { id: { in: patientIds } },
            select: { userId: true },
          });
          
          const patientUserIds = patients.map(p => p.userId).filter(id => id);
          
          const admins = await prisma.user.findMany({
            where: { role: 'admin', isActive: true },
            select: { id: true, name: true, role: true },
          });
          
          const patientUsers = await prisma.user.findMany({
            where: { id: { in: patientUserIds as string[] }, isActive: true },
            select: { id: true, name: true, role: true },
          });
          
          usersToShow = [...admins, ...patientUsers];
        } else if (userRole === 'patient') {
          const patient = await prisma.patient.findFirst({
            where: { userId: userId },
          });
          
          if (patient) {
            const assignments = await prisma.assignedPatient.findMany({
              where: { patientId: patient.id },
            });
            
            const doctorIds = assignments.map(a => a.doctorId);
            const doctorProfiles = await prisma.doctorProfile.findMany({
              where: { id: { in: doctorIds } },
            });
            
            const doctorUserIds = doctorProfiles.map(dp => dp.userId);
            
            const doctors = await prisma.user.findMany({
              where: { id: { in: doctorUserIds }, isActive: true },
              select: { id: true, name: true, role: true },
            });
            
            usersToShow = doctors;
          }
        }
        
        const uniqueUsers = Array.from(new Map(usersToShow.map(u => [u.id, u])).values());
        
        const conversations = uniqueUsers.map(user => ({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          lastMessage: 'No messages yet',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        }));
        
        return res.json(conversations);
      }
      
      const users = await prisma.user.findMany({
        where: { id: { in: Array.from(userIds) } },
        select: { id: true, name: true, role: true },
      });
      
      const userMap = new Map(users.map(u => [u.id, u]));
      const conversationMap = new Map();
      
      for (const message of messages) {
        const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
        const partner = userMap.get(partnerId);
        
        if (!conversationMap.has(partnerId) && partner) {
          conversationMap.set(partnerId, {
            userId: partnerId,
            userName: partner.name,
            userRole: partner.role,
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
            unreadCount: message.receiverId === userId && !message.isRead ? 1 : 0,
          });
        } else if (message.receiverId === userId && !message.isRead) {
          const conv = conversationMap.get(partnerId);
          if (conv) {
            conv.unreadCount++;
          }
        }
      }
      
      const conversations = Array.from(conversationMap.values());
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Error fetching conversations' });
    }
  },

  async getMessages(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.query;
      const currentUserId = req.user.id;
      
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: userId as string },
            { senderId: userId as string, receiverId: currentUserId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      
      const userIds = new Set<string>();
      for (const message of messages) {
        userIds.add(message.senderId);
        userIds.add(message.receiverId);
      }
      
      const users = await prisma.user.findMany({
        where: { id: { in: Array.from(userIds) } },
        select: { id: true, name: true, role: true },
      });
      
      const userMap = new Map(users.map(u => [u.id, u]));
      
      const messagesWithUsers = messages.map(message => ({
        ...message,
        sender: userMap.get(message.senderId),
        receiver: userMap.get(message.receiverId),
      }));
      
      await prisma.message.updateMany({
        where: {
          receiverId: currentUserId,
          senderId: userId as string,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      
      res.json(messagesWithUsers);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  },

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { receiverId, content, patientId, type } = req.body;
      const senderId = req.user.id;
      
      const message = await prisma.message.create({
        data: {
          content,
          type: type || 'text',
          senderId,
          receiverId,
          patientId: patientId || null,
        },
      });
      
      const users = await prisma.user.findMany({
        where: { id: { in: [senderId, receiverId] } },
        select: { id: true, name: true, role: true },
      });
      
      const userMap = new Map(users.map(u => [u.id, u]));
      
      const messageWithUsers = {
        ...message,
        sender: userMap.get(message.senderId),
        receiver: userMap.get(message.receiverId),
      };
      
      res.status(201).json(messageWithUsers);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  },
};