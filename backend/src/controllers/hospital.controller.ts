import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const hospitalController = {
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

  async createHospital(req: AuthRequest, res: Response) {
    try {
      const { name, address, phone, email } = req.body;
      
      const hospital = await prisma.hospital.create({
        data: {
          name,
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

  async updateHospital(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const hospital = await prisma.hospital.update({
        where: { id },
        data,
      });
      
      res.json(hospital);
    } catch (error) {
      console.error('Error updating hospital:', error);
      res.status(500).json({ message: 'Error updating hospital' });
    }
  },

  async deleteHospital(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.hospital.delete({
        where: { id },
      });
      
      res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
      console.error('Error deleting hospital:', error);
      res.status(500).json({ message: 'Error deleting hospital' });
    }
  },
};