"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_controller_1 = require("../controllers/patient.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, patient_controller_1.patientController.getAllPatients);
router.get('/:id', auth_1.authenticateToken, patient_controller_1.patientController.getPatientById);
router.post('/', auth_1.authenticateToken, patient_controller_1.patientController.createPatient);
router.put('/:id', auth_1.authenticateToken, patient_controller_1.patientController.updatePatient);
router.patch('/:id/discharge', auth_1.authenticateToken, patient_controller_1.patientController.dischargePatient);
router.delete('/:id', auth_1.authenticateToken, patient_controller_1.patientController.deletePatient);
router.post('/assign-doctor', auth_1.authenticateToken, (0, auth_1.authorize)('admin', 'superadmin'), patient_controller_1.patientController.assignDoctor);
router.post('/medical-record', auth_1.authenticateToken, patient_controller_1.patientController.addMedicalRecord);
exports.default = router;
