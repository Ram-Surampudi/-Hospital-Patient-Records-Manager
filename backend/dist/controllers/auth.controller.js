"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
exports.authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await index_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            if (!user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated' });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    async getMe(req, res) {
        res.json(req.user);
    },
    async logout(req, res) {
        res.json({ message: 'Logged out successfully' });
    },
};
