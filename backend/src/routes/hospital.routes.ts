import express from 'express';
import { hospitalController } from '../controllers/hospital.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, hospitalController.getAllHospitals);
router.post('/', authenticateToken, authorize('superadmin'), hospitalController.createHospital);
router.put('/:id', authenticateToken, authorize('superadmin'), hospitalController.updateHospital);
router.delete('/:id', authenticateToken, authorize('superadmin'), hospitalController.deleteHospital);

export default router;