import express from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

// Fix: Change getPatientDashboardData to getPatientDashboard
router.get('/dashboard', authenticateToken, authorize('patient'), patientController.getPatientDashboard);
router.put('/profile', authenticateToken, authorize('patient'), patientController.updatePatientProfile);
router.get('/medical-records', authenticateToken, authorize('patient'), patientController.getPatientMedicalRecords);

export default router;