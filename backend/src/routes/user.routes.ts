import express from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

// User management
router.get('/', authenticateToken, userController.getAllUsers);
router.patch('/:id/toggle', authenticateToken, userController.toggleUserStatus);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.get('/me', authenticateToken, userController.getCurrentUser);

router.post('/hospitals', authenticateToken, authorize('superadmin'), userController.createHospital);
router.get('/hospitals', authenticateToken, userController.getAllHospitals);
router.get('/admin-hospitals', authenticateToken, authorize('superadmin'), userController.getAdminHospitals);

router.get('/doctors', authenticateToken, userController.getDoctorsForHospital);

router.post('/admin', authenticateToken, authorize('superadmin'), userController.createAdmin);
router.delete('/doctor/:id', authenticateToken, authorize('superadmin', 'admin'), userController.deleteDoctor);

router.post('/doctor', authenticateToken, authorize('superadmin', 'admin'), userController.createDoctor);


router.post('/patient', authenticateToken, authorize('superadmin', 'admin', 'doctor'), userController.createPatient);


router.get('/doctors', authenticateToken, userController.getDoctorsForHospital);

export default router;