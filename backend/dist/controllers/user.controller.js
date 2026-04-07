"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
exports.userController = {
    async getAllAdmins(req, res) {
        try {
            const users = await index_1.prisma.user.findMany({
                where: {
                    role: {
                        in: ['admin', 'doctor', 'nurse'],
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json(users);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    },
    async createAdmin(req, res) {
        try {
            const { name, email, password, role } = req.body;
            const existingUser = await index_1.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await index_1.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'admin',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            });
            res.status(201).json(user);
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    },
    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const user = await index_1.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.role === 'superadmin') {
                return res.status(403).json({ message: 'Cannot modify super admin' });
            }
            const updatedUser = await index_1.prisma.user.update({
                where: { id },
                data: { isActive: !user.isActive },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            });
            res.json(updatedUser);
        }
        catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ message: 'Error updating user status' });
        }
    },
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await index_1.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.role === 'superadmin') {
                return res.status(403).json({ message: 'Cannot delete super admin' });
            }
            await index_1.prisma.user.delete({
                where: { id },
            });
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    },
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;
            const user = await index_1.prisma.user.update({
                where: { id },
                data: { name, email, role },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            });
            res.json(user);
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Error updating user' });
        }
    },
    async getDoctors(req, res) {
        try {
            const doctors = await index_1.prisma.user.findMany({
                where: {
                    role: 'doctor',
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });
            res.json(doctors);
        }
        catch (error) {
            console.error('Error fetching doctors:', error);
            res.status(500).json({ message: 'Error fetching doctors' });
        }
    },
};
