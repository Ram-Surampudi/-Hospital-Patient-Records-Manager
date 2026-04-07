import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const patientController = {
  async getAllPatients(req: AuthRequest, res: Response) {
    try {
      const { ward, status, search } = req.query;
      const userRole = req.user.role;
      const userId = req.user.id;
      
      const where: any = {};
      
      // Role-based filtering
      if (userRole === 'admin') {
        const adminHospital = await prisma.hospitalAdmin.findFirst({
          where: { adminId: userId },
        });
        if (adminHospital) {
          where.hospitalId = adminHospital.hospitalId;
        } else {
          return res.json([]);
        }
      } else if (userRole === 'doctor') {
        const doctorProfile = await prisma.doctorProfile.findUnique({
          where: { userId: userId },
        });
        if (doctorProfile) {
          const assignments = await prisma.assignedPatient.findMany({
            where: { doctorId: doctorProfile.id },
          });
          const patientIds = assignments.map(a => a.patientId);
          where.id = { in: patientIds };
        } else {
          return res.json([]);
        }
      }
      
      if (ward) where.ward = ward;
      if (status) where.status = status;
      
      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { patientId: { contains: search as string } },
          { phone: { contains: search as string } },
        ];
      }

      const patients = await prisma.patient.findMany({
        where,
        orderBy: { admittedAt: 'desc' },
      });
      
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Error fetching patients' });
    }
  },

  async getPatientById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const patient = await prisma.patient.findUnique({
        where: { id },
      });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Get creator info from user who created (using createdBy from user table if available)
      let creator = null;
      if (patient.userId) {
        const user = await prisma.user.findUnique({
          where: { id: patient.userId },
          select: { name: true, email: true, role: true },
        });
        if (user && user.role === 'patient') {
          // Find who created this patient
          const creatorUser = await prisma.user.findFirst({
            where: { createdBy: patient.userId },
            select: { name: true, email: true, role: true },
          });
          creator = creatorUser;
        }
      }
      
      // Get assigned doctors for this patient
      const assignments = await prisma.assignedPatient.findMany({
        where: { patientId: patient.id },
      });
      
      const doctorIds = assignments.map(a => a.doctorId);
      const doctorProfiles = await prisma.doctorProfile.findMany({
        where: { id: { in: doctorIds } },
      });
      
      const doctorUsers = await prisma.user.findMany({
        where: { id: { in: doctorProfiles.map(dp => dp.userId) } },
      });
      
      const assignedDoctors = doctorProfiles.map(profile => ({
        ...profile,
        user: doctorUsers.find(u => u.id === profile.userId),
      }));
      
      // Get medical records
      const medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      });
      
      // Get messages
      const messages = await prisma.message.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      
      res.json({
        ...patient,
        creator,
        assignedDoctors,
        medicalRecords,
        messages,
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ message: 'Error fetching patient' });
    }
  },

  async createPatient(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        age,
        gender,
        bloodGroup,
        phone,
        address,
        emergencyContact,
        ward,
        roomNumber,
        bedNumber,
        diagnosis,
        allergies,
        chronicConditions,
      } = req.body;
      
      const patientId = `HOSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      let hospitalId = null;
      if (req.user.role === 'admin') {
        const adminHospital = await prisma.hospitalAdmin.findFirst({
          where: { adminId: req.user.id },
        });
        hospitalId = adminHospital?.hospitalId || null;
      }
      
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
          ward,
          roomNumber: roomNumber || null,
          bedNumber: bedNumber || null,
          diagnosis: diagnosis || null,
          allergies: allergies || null,
          chronicConditions: chronicConditions || null,
          status: 'admitted',
          hospitalId,
        },
      });
      
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ message: 'Error creating patient' });
    }
  },

  async updatePatient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const patient = await prisma.patient.update({
        where: { id },
        data: updateData,
      });
      
      res.json(patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({ message: 'Error updating patient' });
    }
  },

  async dischargePatient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const patient = await prisma.patient.update({
        where: { id },
        data: {
          status: 'discharged',
          dischargedAt: new Date(),
        },
      });
      
      res.json(patient);
    } catch (error) {
      console.error('Error discharging patient:', error);
      res.status(500).json({ message: 'Error discharging patient' });
    }
  },

  async deletePatient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.patient.delete({
        where: { id },
      });
      
      res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ message: 'Error deleting patient' });
    }
  },

  async assignDoctor(req: AuthRequest, res: Response) {
    try {
      const { patientId, doctorId } = req.body;
      
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: doctorId },
      });
      
      if (!doctorProfile) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      const assignment = await prisma.assignedPatient.create({
        data: {
          patientId,
          doctorId: doctorProfile.id,
          assignedBy: req.user.id,
          isPrimary: false,
        },
      });
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error assigning doctor:', error);
      res.status(500).json({ message: 'Error assigning doctor' });
    }
  },

  async addMedicalRecord(req: AuthRequest, res: Response) {
    try {
      const { patientId, recordType, title, description, fileUrl } = req.body;
      
      const record = await prisma.medicalRecord.create({
        data: {
          patientId,
          recordType,
          title,
          description: description || null,
          fileUrl: fileUrl || null,
          createdBy: req.user.id,
        },
      });
      
      res.status(201).json(record);
    } catch (error) {
      console.error('Error adding medical record:', error);
      res.status(500).json({ message: 'Error adding medical record' });
    }
  },

  async getDoctorPatients(req: AuthRequest, res: Response) {
    try {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.id },
      });
      
      if (!doctorProfile) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      
      const assignments = await prisma.assignedPatient.findMany({
        where: { doctorId: doctorProfile.id },
      });
      
      const patients: any[] = [];
      for (const assignment of assignments) {
        const patient = await prisma.patient.findUnique({
          where: { id: assignment.patientId },
        });
        if (patient) {
          patients.push(patient);
        }
      }
      
      res.json(patients);
    } catch (error) {
      console.error('Error fetching doctor patients:', error);
      res.status(500).json({ message: 'Error fetching patients' });
    }
  },

  async getAdminDashboard(req: AuthRequest, res: Response) {
    try {
      const adminHospital = await prisma.hospitalAdmin.findFirst({
        where: { adminId: req.user.id },
      });
      
      if (!adminHospital) {
        return res.status(404).json({ message: 'Hospital not found for this admin' });
      }
      
      const hospital = await prisma.hospital.findUnique({
        where: { id: adminHospital.hospitalId },
      });
      
      const hospitalDoctors = await prisma.hospitalDoctor.findMany({
        where: { hospitalId: adminHospital.hospitalId },
      });
      
      const doctorsList: any[] = [];
      for (const hd of hospitalDoctors) {
        const doctorProfile = await prisma.doctorProfile.findUnique({
          where: { id: hd.doctorId },
        });
        if (doctorProfile) {
          const doctorUser = await prisma.user.findUnique({
            where: { id: doctorProfile.userId },
          });
          if (doctorUser) {
            doctorsList.push({
              id: doctorUser.id,
              name: doctorUser.name,
              email: doctorUser.email,
              specialization: doctorProfile.specialization,
              qualification: doctorProfile.qualification,
              experienceYears: doctorProfile.experienceYears,
              department: doctorProfile.department,
              consultationFee: doctorProfile.consultationFee,
              isActive: doctorUser.isActive,
              createdAt: doctorUser.createdAt,
            });
          }
        }
      }
      
      const patients = await prisma.patient.findMany({
        where: { hospitalId: adminHospital.hospitalId },
        orderBy: { admittedAt: 'desc' },
      });
      
      const totalDoctors = doctorsList.length;
      const totalPatients = patients.length;
      const admittedPatients = patients.filter(p => p.status === 'admitted').length;
      const dischargedPatients = patients.filter(p => p.status === 'discharged').length;
      
      res.json({
        hospital: {
          id: hospital?.id,
          name: hospital?.name,
        },
        stats: {
          totalDoctors,
          totalPatients,
          admittedPatients,
          dischargedPatients,
        },
        doctors: doctorsList,
        patients,
      });
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      res.status(500).json({ message: 'Error fetching dashboard data' });
    }
  },

  async getPatientMedicalRecordsById(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      
      const records = await prisma.medicalRecord.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
      
      const recordsWithDoctors = await Promise.all(records.map(async (record) => {
        const doctor = await prisma.user.findUnique({
          where: { id: record.createdBy },
          select: { name: true, email: true },
        });
        return {
          ...record,
          doctor,
        };
      }));
      
      res.json(recordsWithDoctors);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      res.status(500).json({ message: 'Error fetching medical records' });
    }
  },
  // Add these functions to the patientController object

async getPatientDashboard(req: AuthRequest, res: Response) {
  try {
    const patientUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.id },
    });
    
    const patient = await prisma.patient.findFirst({
      where: { userId: req.user.id },
    });
    
    let medicalRecords: any[] = [];
    let messages: any[] = [];
    let assignedDoctors: any[] = [];
    
    if (patient) {
      medicalRecords = await prisma.medicalRecord.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      // Add doctor names to medical records
      const recordsWithDoctors = await Promise.all(medicalRecords.map(async (record) => {
        const doctor = await prisma.user.findUnique({
          where: { id: record.createdBy },
          select: { name: true, email: true },
        });
        return { ...record, doctor };
      }));
      medicalRecords = recordsWithDoctors;
      
      messages = await prisma.message.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      
      // Get sender/receiver details for messages
      const messagesWithUsers = await Promise.all(messages.map(async (msg) => {
        const sender = await prisma.user.findUnique({
          where: { id: msg.senderId },
          select: { name: true, role: true },
        });
        const receiver = await prisma.user.findUnique({
          where: { id: msg.receiverId },
          select: { name: true, role: true },
        });
        return { ...msg, sender, receiver };
      }));
      messages = messagesWithUsers;
      
      const assignments = await prisma.assignedPatient.findMany({
        where: { patientId: patient.id },
      });
      
      const doctorIds = assignments.map(a => a.doctorId);
      const doctorProfiles = await prisma.doctorProfile.findMany({
        where: { id: { in: doctorIds } },
      });
      
      const doctorUsers = await prisma.user.findMany({
        where: { id: { in: doctorProfiles.map(dp => dp.userId) } },
        select: { id: true, name: true, email: true },
      });
      
      assignedDoctors = doctorProfiles.map(profile => ({
        id: doctorUsers.find(u => u.id === profile.userId)?.id,
        name: doctorUsers.find(u => u.id === profile.userId)?.name,
        email: doctorUsers.find(u => u.id === profile.userId)?.email,
        specialization: profile.specialization,
        qualification: profile.qualification,
      }));
    }
    
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({
      profile: patientProfile,
      patient,
      medicalRecords,
      messages,
      notifications,
      doctors: assignedDoctors,
    });
  } catch (error) {
    console.error('Error fetching patient dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
},

async updatePatientProfile(req: AuthRequest, res: Response) {
  try {
    const {
      phone,
      emergencyContact,
      emergencyPhone,
      allergies,
      chronicConditions,
    } = req.body;
    
    const updatedProfile = await prisma.patientProfile.update({
      where: { userId: req.user.id },
      data: {
        allergies,
        chronicConditions,
        emergencyContact,
        emergencyPhone,
      },
    });
    
    if (phone) {
      await prisma.patient.updateMany({
        where: { userId: req.user.id },
        data: { phone, emergencyContact },
      });
    }
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
},

async getPatientMedicalRecords(req: AuthRequest, res: Response) {
  try {
    const patient = await prisma.patient.findFirst({
      where: { userId: req.user.id },
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });
    
    const recordsWithDoctors = await Promise.all(records.map(async (record) => {
      const doctor = await prisma.user.findUnique({
        where: { id: record.createdBy },
        select: { name: true, email: true },
      });
      return {
        ...record,
        doctor,
      };
    }));
    
    res.json(recordsWithDoctors);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Error fetching medical records' });
  }
},

  async getAssignedDoctors(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const assignments = await prisma.assignedPatient.findMany({
        where: { patientId: id },
      });
      
      const doctorsList: any[] = [];
      for (const assignment of assignments) {
        const doctorProfile = await prisma.doctorProfile.findUnique({
          where: { id: assignment.doctorId },
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
              qualification: doctorProfile.qualification,
              isPrimary: assignment.isPrimary,
            });
          }
        }
      }
      
      res.json(doctorsList);
    } catch (error) {
      console.error('Error fetching assigned doctors:', error);
      res.status(500).json({ message: 'Error fetching assigned doctors' });
    }
  },

  async getAdminDoctors(req: AuthRequest, res: Response) {
    try {
      const adminHospital = await prisma.hospitalAdmin.findFirst({
        where: { adminId: req.user.id },
      });
      
      if (!adminHospital) {
        return res.status(404).json({ message: 'Hospital not found for this admin' });
      }
      
      const hospitalDoctors = await prisma.hospitalDoctor.findMany({
        where: { hospitalId: adminHospital.hospitalId },
      });
      
      const doctorsList: any[] = [];
      for (const hd of hospitalDoctors) {
        const doctorProfile = await prisma.doctorProfile.findUnique({
          where: { id: hd.doctorId },
        });
        if (doctorProfile) {
          const doctorUser = await prisma.user.findUnique({
            where: { id: doctorProfile.userId },
          });
          if (doctorUser) {
            doctorsList.push({
              id: doctorUser.id,
              name: doctorUser.name,
              email: doctorUser.email,
              specialization: doctorProfile.specialization,
              qualification: doctorProfile.qualification,
              experienceYears: doctorProfile.experienceYears,
              department: doctorProfile.department,
              consultationFee: doctorProfile.consultationFee,
              isActive: doctorUser.isActive,
              createdAt: doctorUser.createdAt,
            });
          }
        }
      }
      
      res.json(doctorsList);
    } catch (error) {
      console.error('Error fetching admin doctors:', error);
      res.status(500).json({ message: 'Error fetching doctors' });
    }
  },
};