import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { console } from 'inspector/promises';

export const userController = {
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { role } = req.query;
      const whereCondition: any = {};
      if (role) whereCondition.role = role;
      
      const users = await prisma.user.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
      });
      
      const usersWithProfiles = await Promise.all(users.map(async (user) => {
        let doctorProfile = null;
        let patientProfile = null;
        
        if (user.role === 'doctor') {
          doctorProfile = await prisma.doctorProfile.findUnique({
            where: { userId: user.id },
          });
        } else if (user.role === 'patient') {
          patientProfile = await prisma.patientProfile.findUnique({
            where: { userId: user.id },
          });
        }
        
        return { ...user, doctorProfile, patientProfile };
      }));
      
      res.json(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },
  async deleteDoctor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } }); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      } 
      if (user.role !== 'doctor') {
        return res.status(400).json({ message: 'User is not a doctor' });
      }
      await prisma.user.delete({ where: { id } });
      res.json({ message: 'Doctor deleted successfully' });  
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ message: 'Error deleting doctor' });
    }
  },
async findAllEmails(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({    
        select: { email: true },
      });
      const emails = users.map(user => user.email);
      res.json(emails);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ message: 'Error fetching emails' });
    }
  },
  async createHospital(req: AuthRequest, res: Response) {
    try {
      const { name, type, address, phone, email } = req.body;
      
      if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only Super Admin can create hospitals' });
      }
      
      const hospital = await prisma.hospital.create({
        data: {
          name,
          type: type || 'big',
          address,
          phone,
          email,
        },
      });
      
      res.status(201).json(hospital);
    } catch (error) {
      console.error('Error creating hospital:', error);
      res.status(500).json({ message: 'Error creating hospital' });
    }
  },

  async getAllHospitals(req: AuthRequest, res: Response) {
    try {
      const hospitals = await prisma.hospital.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({ message: 'Error fetching hospitals' });
    }
  },

  async createAdmin(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, hospitalId } = req.body;
      
      if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Only Super Admin can create Admin accounts' });
      }
      
      // Check if hospital is big type
      const hospital = await prisma.hospital.findUnique({
        where: { id: hospitalId },
      });
      
      if (!hospital || hospital.type !== 'big') {
        return res.status(400).json({ message: 'Admin can only be assigned to BIG hospitals' });
      }
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'admin',
          createdBy: req.user.id,
        },
      });
      
      await prisma.hospitalAdmin.create({
        data: {
          hospitalId,
          adminId: user.id,
        },
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ message: 'Error creating admin' });
    }
  },

  async createDoctor(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      email,
      specialization,
      qualification,
      experienceYears,
      licenseNumber,
      department,
      consultationFee,
      // Remove hospitalId from request body - we'll get it from admin's session
    } = req.body;
    
    // Check permissions
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions to create doctor' });
    }
    
    let hospitalId: string;
    
    // If admin, get their hospital ID
    if (req.user.role === 'admin') {
      const adminHospital = await prisma.hospitalAdmin.findFirst({
        where: { adminId: req.user.id },
      });
      
      if (!adminHospital) {
        return res.status(404).json({ message: 'No hospital found for this admin' });
      }
      hospitalId = adminHospital.hospitalId;
    } else if (req.user.role === 'superadmin') {
      // Super admin needs to provide hospitalId
      if (!req.body.hospitalId) {
        return res.status(400).json({ message: 'Hospital ID is required for super admin' });
      }
      hospitalId = req.body.hospitalId;
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Get hospital info
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash('doctor123', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'doctor',
        createdBy: req.user.id,
      },
    });
    
    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        specialization,
        qualification,
        experienceYears: parseInt(experienceYears),
        licenseNumber,
        department,
        consultationFee: consultationFee ? parseFloat(consultationFee) : null,
        userId: user.id,
      },
    });
    
    await prisma.hospitalDoctor.create({
      data: {
        hospitalId,
        doctorId: doctorProfile.id,
      },
    });
    
    // Create notification for hospital admin if hospital is big and user is superadmin
    if (hospital.type === 'big' && req.user.role === 'superadmin') {
      const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
        where: { hospitalId },
      });
      if (hospitalAdmin) {
        await prisma.notification.create({
          data: {
            userId: hospitalAdmin.adminId,
            title: 'New Doctor Added',
            message: `Dr. ${name} has been added to your hospital by Super Admin.`,
            type: 'message',
          },
        });
      }
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorProfile,
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor' });
  }
},
async getCurrentUser(req: AuthRequest, res: Response) {
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
    
    res.json({
      ...user,
      doctorProfile,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
},

async createPatient(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      email,
      phone,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      diagnosis,
      ward,
      doctorId,
    } = req.body;
    
    // Get hospital ID from admin's session
    let hospitalId: string | null = null;
    
    if (req.user.role === 'admin') {
      const adminHospital = await prisma.hospitalAdmin.findFirst({
        where: { adminId: req.user.id },
      });
      if (adminHospital) {
        hospitalId = adminHospital.hospitalId;
      }
    } else if (req.user.role === 'superadmin' && req.body.hospitalId) {
      hospitalId = req.body.hospitalId;
    }
    
    let user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('patient123', 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'patient',
          createdBy: req.user.id,
        },
      });
      
      await prisma.patientProfile.create({
        data: {
          bloodGroup,
          allergies: '',
          emergencyContact,
          userId: user.id,
        },
      });
    }
    
    const patientId = `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const patient = await prisma.patient.create({
      data: {
        patientId,
        name,
        age: parseInt(age),
        gender,
        bloodGroup,
        phone,
        address: address || null,
        emergencyContact: emergencyContact || null,
        diagnosis: diagnosis || null,
        ward,
        status: 'admitted',
        hospitalId: hospitalId,
        userId: user.id,
      },
    });
    
    // Assign to doctor if specified
    if (doctorId) {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: doctorId },
      });
      
      if (doctorProfile) {
        await prisma.assignedPatient.create({
          data: {
            patientId: patient.id,
            doctorId: doctorProfile.id,
            assignedBy: req.user.id,
            isPrimary: true,
          },
        });
        
        const doctorUser = await prisma.user.findUnique({
          where: { id: doctorId },
        });
        
        await prisma.message.create({
          data: {
            content: `Hello ${name}, I am Dr. ${doctorUser?.name}. I will be your attending physician.`,
            senderId: doctorId,
            receiverId: user.id,
            patientId: patient.id,
            type: 'text',
          },
        });
      }
    }
    
    res.status(201).json({
      user,
      patient,
      temporaryPassword: 'patient123',
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Error creating patient' });
  }
},

  async getDoctorsForHospital(req: AuthRequest, res: Response) {
  try {
    const { hospitalId } = req.query;
    
    let targetHospitalId = hospitalId as string;
    
    // If admin, get their hospital
    if (req.user.role === 'admin' && !targetHospitalId) {
      const adminHospital = await prisma.hospitalAdmin.findFirst({
        where: { adminId: req.user.id },
      });
      if (adminHospital) {
        targetHospitalId = adminHospital.hospitalId;
      }
    }
    
    // Get all doctors (for superadmin and if no hospital specified)
    if (!targetHospitalId) {
      const allDoctors = await prisma.user.findMany({
        where: { role: 'doctor', isActive: true },
        select: { id: true, name: true, email: true },
      });
      
      const doctorsWithProfiles = await Promise.all(allDoctors.map(async (doctor) => {
        const profile = await prisma.doctorProfile.findUnique({
          where: { userId: doctor.id },
          select: { specialization: true },
        });
        return {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specialization: profile?.specialization || 'General',
        };
      }));
      
      return res.json(doctorsWithProfiles);
    }
    
    // Get doctors for specific hospital
    const hospitalDoctors = await prisma.hospitalDoctor.findMany({
      where: { hospitalId: targetHospitalId },
    });
    
    const doctorsList: any[] = [];
    for (const hd of hospitalDoctors) {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { id: hd.doctorId },
      });
      if (doctorProfile) {
        const doctorUser = await prisma.user.findUnique({
          where: { id: doctorProfile.userId },
          select: { id: true, name: true, email: true },
        });
        if (doctorUser) {
          doctorsList.push({
            id: doctorUser.id,
            name: doctorUser.name,
            email: doctorUser.email,
            specialization: doctorProfile.specialization,
          });
        }
      }
    }
    
    res.json(doctorsList);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
},

  async getAdminHospitals(req: AuthRequest, res: Response) {
    try {
      const hospitals = await prisma.hospital.findMany({
        where: { type: 'big' },
        select: { id: true, name: true },
      });
      res.json(hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({ message: 'Error fetching hospitals' });
    }
  },

  async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'superadmin') {
        return res.status(403).json({ message: 'Cannot modify super admin' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
      });

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Error updating user status' });
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'superadmin') {
        return res.status(403).json({ message: 'Cannot delete super admin' });
      }

      await prisma.user.delete({ where: { id } });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },
};