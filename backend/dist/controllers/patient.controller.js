"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = void 0;
const index_1 = require("../index");
exports.patientController = {
    async getAllPatients(req, res) {
        try {
            const { ward, status, search, doctorId } = req.query;
            const where = {};
            if (ward)
                where.ward = ward;
            if (status)
                where.status = status;
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { patientId: { contains: search } },
                    { phone: { contains: search } },
                ];
            }
            if (doctorId && req.user.role === 'doctor') {
                where.assignedDoctors = {
                    some: { doctorId: doctorId }
                };
            }
            const patients = await index_1.prisma.patient.findMany({
                where,
                include: {
                    assignedDoctors: {
                        include: {
                            doctor: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    messages: {
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { admittedAt: 'desc' },
            });
            res.json(patients);
        }
        catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json({ message: 'Error fetching patients' });
        }
    },
    async getPatientById(req, res) {
        try {
            const { id } = req.params;
            const patient = await index_1.prisma.patient.findUnique({
                where: { id },
                include: {
                    assignedDoctors: {
                        include: {
                            doctor: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    medicalRecords: {
                        orderBy: { createdAt: 'desc' },
                    },
                    messages: {
                        include: {
                            sender: {
                                select: { id: true, name: true, role: true },
                            },
                            receiver: {
                                select: { id: true, name: true, role: true },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 50,
                    },
                },
            });
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.json(patient);
        }
        catch (error) {
            console.error('Error fetching patient:', error);
            res.status(500).json({ message: 'Error fetching patient' });
        }
    },
    async createPatient(req, res) {
        try {
            const { name, age, gender, bloodGroup, phone, address, emergencyContact, ward, roomNumber, bedNumber, diagnosis, allergies, chronicConditions, doctorIds, } = req.body;
            const patientId = `HOSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const patient = await index_1.prisma.patient.create({
                data: {
                    patientId,
                    name,
                    age: parseInt(age),
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
                    assignedDoctors: doctorIds && doctorIds.length > 0 ? {
                        create: doctorIds.map((doctorId) => ({
                            doctorId,
                        })),
                    } : undefined,
                },
                include: {
                    assignedDoctors: {
                        include: {
                            doctor: true,
                        },
                    },
                },
            });
            res.status(201).json(patient);
        }
        catch (error) {
            console.error('Error creating patient:', error);
            res.status(500).json({ message: 'Error creating patient' });
        }
    },
    async updatePatient(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const patient = await index_1.prisma.patient.update({
                where: { id },
                data: updateData,
                include: {
                    assignedDoctors: {
                        include: {
                            doctor: true,
                        },
                    },
                },
            });
            res.json(patient);
        }
        catch (error) {
            console.error('Error updating patient:', error);
            res.status(500).json({ message: 'Error updating patient' });
        }
    },
    async dischargePatient(req, res) {
        try {
            const { id } = req.params;
            const patient = await index_1.prisma.patient.update({
                where: { id },
                data: {
                    status: 'discharged',
                    dischargedAt: new Date(),
                },
            });
            res.json(patient);
        }
        catch (error) {
            console.error('Error discharging patient:', error);
            res.status(500).json({ message: 'Error discharging patient' });
        }
    },
    async deletePatient(req, res) {
        try {
            const { id } = req.params;
            await index_1.prisma.patient.delete({
                where: { id },
            });
            res.json({ message: 'Patient deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting patient:', error);
            res.status(500).json({ message: 'Error deleting patient' });
        }
    },
    async assignDoctor(req, res) {
        try {
            const { patientId, doctorId } = req.body;
            const assignment = await index_1.prisma.assignedPatient.create({
                data: {
                    patientId,
                    doctorId,
                },
                include: {
                    doctor: true,
                    patient: true,
                },
            });
            res.status(201).json(assignment);
        }
        catch (error) {
            console.error('Error assigning doctor:', error);
            res.status(500).json({ message: 'Error assigning doctor' });
        }
    },
    async addMedicalRecord(req, res) {
        try {
            const { patientId, recordType, title, description, fileUrl } = req.body;
            const record = await index_1.prisma.medicalRecord.create({
                data: {
                    patientId,
                    recordType,
                    title,
                    description,
                    fileUrl,
                    createdBy: req.user.id,
                },
            });
            res.status(201).json(record);
        }
        catch (error) {
            console.error('Error adding medical record:', error);
            res.status(500).json({ message: 'Error adding medical record' });
        }
    },
};
