import express from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

// General patient routes
router.get('/', authenticateToken, patientController.getAllPatients);
router.get('/:id', authenticateToken, patientController.getPatientById);
router.post('/', authenticateToken, patientController.createPatient);
router.put('/:id', authenticateToken, patientController.updatePatient);
router.patch('/:id/discharge', authenticateToken, patientController.dischargePatient);
router.delete('/:id', authenticateToken, patientController.deletePatient);
router.post('/assign-doctor', authenticateToken, authorize('admin', 'superadmin'), patientController.assignDoctor);
router.post('/medical-record', authenticateToken, patientController.addMedicalRecord);

// Medical records and assigned doctors
router.get('/:patientId/medical-records', authenticateToken, patientController.getPatientMedicalRecordsById);
router.get('/:id/doctors', authenticateToken, patientController.getAssignedDoctors);

// Doctor specific routes
router.get('/doctor/my-patients', authenticateToken, authorize('doctor'), patientController.getDoctorPatients);

// Admin specific routes
router.get('/admin/dashboard', authenticateToken, authorize('admin'), patientController.getAdminDashboard);
router.get('/admin/doctors', authenticateToken, authorize('admin'), patientController.getAdminDoctors);

export default router;