import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated. Please contact administrator.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if patient needs to change password
      const needsPasswordChange = user.role === 'patient' && password === 'patient123';

      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Get doctor profile if exists
      let doctorProfile = null;
      if (user.role === 'doctor') {
        doctorProfile = await prisma.doctorProfile.findUnique({
          where: { userId: user.id },
        });
      }

      // Get patient profile if exists
      let patientProfile = null;
      if (user.role === 'patient') {
        patientProfile = await prisma.patientProfile.findUnique({
          where: { userId: user.id },
        });
      }

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          needsPasswordChange,
          doctorProfile,
          patientProfile,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ADD THIS FUNCTION - Change Password
  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Error changing password' });
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      let doctorProfile = null;
      if (user?.role === 'doctor') {
        doctorProfile = await prisma.doctorProfile.findUnique({
          where: { userId: user.id },
        });
      }

      let patientProfile = null;
      let assignedDoctors = [];
      
      if (user?.role === 'patient') {
        patientProfile = await prisma.patientProfile.findUnique({
          where: { userId: user.id },
        });
        
        // Get assigned doctors for patient
        const patient = await prisma.patient.findFirst({
          where: { userId: user.id },
        });
        
        if (patient) {
          const assignments = await prisma.assignedPatient.findMany({
            where: { patientId: patient.id },
          });
          
          const doctorIds = assignments.map(a => a.doctorId);
          const doctorProfiles = await prisma.doctorProfile.findMany({
            where: { id: { in: doctorIds } },
          });
          
          // Get user info for each doctor
          for (const profile of doctorProfiles) {
            const doctorUser = await prisma.user.findUnique({
              where: { id: profile.userId },
              select: { id: true, name: true, email: true, role: true },
            });
            if (doctorUser) {
              assignedDoctors.push({
                ...profile,
                user: doctorUser,
              });
            }
          }
        }
      }

      res.json({
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        isActive: user?.isActive,
        doctorProfile,
        patientProfile: patientProfile ? {
          ...patientProfile,
          assignedDoctors,
        } : null,
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    res.json({ message: 'Logged out successfully' });
  },
};