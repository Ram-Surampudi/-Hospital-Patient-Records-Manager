"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorize)('superadmin'), user_controller_1.userController.getAllAdmins);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorize)('superadmin'), user_controller_1.userController.createAdmin);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorize)('superadmin'), user_controller_1.userController.updateUser);
router.patch('/:id/toggle', auth_1.authenticateToken, (0, auth_1.authorize)('superadmin'), user_controller_1.userController.toggleUserStatus);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorize)('superadmin'), user_controller_1.userController.deleteUser);
router.get('/doctors', auth_1.authenticateToken, user_controller_1.userController.getDoctors);
exports.default = router;
