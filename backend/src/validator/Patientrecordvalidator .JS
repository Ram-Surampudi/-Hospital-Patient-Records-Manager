// validators/patientRecordValidator.js
//

//   - id          String  @id @default(uuid())
//   - patientId   String  → FK to User.id (UUID)
//   - doctorId    String  → FK to User.id (UUID)
//   - name        String
//   - age         Int
//   - gender      Gender      { MALE, FEMALE, OTHERS }
//   - bloodGroup  BloodGroup  { A_POSITIVE, A_NEGITIVE, B_POSITIVE, ... }
//   - ward        String      (free text — no Prisma enum)
//   - diagnosis   String
//   - status      PatientStatus { Admitted, Discharged }
//   - admittedAt  DateTime    @default(now())
//   - dischargedAt DateTime?

const { body, param, query } = require("express-validator");



const GENDERS = ["MALE", "FEMALE", "OTHERS"];

const BLOOD_GROUPS = [
    "A_POSITIVE",
    "A_NEGITIVE",
    "B_POSITIVE",
    "B_NEGITIVE",
    "O_POSITIVE",
    "O_NEGITIVE",
    "AB_POSITIVE",
    "AB_NEGITIVE",
    "ABO_POSITIVE",
    "ABO_NEGITIVE",
];

const PATIENT_STATUSES = ["Admitted", "Discharged"];

// Common ward names — ward is a free String in your schema,
// so we validate reasonable values but allow custom entries too.
const WARDS = [
    "ICU",
    "General",
    "Emergency",
    "Pediatrics",
    "Maternity",
    "Orthopedic",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Surgery",
];


const createPatientRecordValidator = [
    body("patientId")
        .exists({ checkFalsy: true })
        .withMessage("patientId is required")
        .isUUID()
        .withMessage("patientId must be a valid UUID referencing a User with role PATIENT"),

    body("doctorId")
        .exists({ checkFalsy: true })
        .withMessage("doctorId is required")
        .isUUID()
        .withMessage("doctorId must be a valid UUID referencing a User with role DOCTOR"),

    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Patient name is required")
        .isString()
        .withMessage("Name must be a string")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z\s'.,-]+$/)
        .withMessage("Name must contain only letters, spaces, and common punctuation"),

    body("age")
        .exists({ checkFalsy: false })
        .withMessage("Age is required")
        .isInt({ min: 0, max: 150 })
        .withMessage("Age must be a whole number between 0 and 150")
        .toInt(),

    body("gender")
        .exists({ checkFalsy: true })
        .withMessage("Gender is required")
        .isIn(GENDERS)
        .withMessage(`Gender must be one of: ${GENDERS.join(", ")}`),

    body("bloodGroup")
        .exists({ checkFalsy: true })
        .withMessage("Blood group is required")
        .isIn(BLOOD_GROUPS)
        .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(", ")}`),

    body("ward")
        .exists({ checkFalsy: true })
        .withMessage("Ward is required")
        .isString()
        .withMessage("Ward must be a string")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Ward name must be between 2 and 100 characters"),

    body("diagnosis")
        .exists({ checkFalsy: true })
        .withMessage("Diagnosis is required")
        .isString()
        .withMessage("Diagnosis must be a string")
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage("Diagnosis must be between 2 and 1000 characters"),

    body("status")
        .optional()
        .isIn(PATIENT_STATUSES)
        .withMessage(`Status must be one of: ${PATIENT_STATUSES.join(", ")}`),

    body("admittedAt")
        .optional()
        .isISO8601()
        .withMessage("admittedAt must be a valid ISO 8601 date (e.g. 2024-06-15 or 2024-06-15T10:30:00Z)")
        .toDate()
        .custom((value) => {
            const now = new Date();
            now.setHours(23, 59, 59, 999); // allow today
            if (value > now) {
                throw new Error("Admission date cannot be in the future");
            }
            return true;
        }),


    body("dischargedAt")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("dischargedAt must be a valid ISO 8601 date")
        .toDate()
        .custom((value, { req }) => {
            const admitted = req.body.admittedAt
                ? new Date(req.body.admittedAt)
                : new Date();
            if (value <= admitted) {
                throw new Error("Discharge date must be after the admission date");
            }
            return true;
        }),
];


const updatePatientRecordValidator = [
    param("id")
        .exists()
        .withMessage("Record ID is required")
        .isUUID()
        .withMessage("Record ID must be a valid UUID"),

    body("patientId")
        .optional()
        .isUUID()
        .withMessage("patientId must be a valid UUID"),

    body("doctorId")
        .optional()
        .isUUID()
        .withMessage("doctorId must be a valid UUID"),

    body("name")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z\s'.,-]+$/)
        .withMessage("Name must contain only letters, spaces, and common punctuation"),

    body("age")
        .optional()
        .isInt({ min: 0, max: 150 })
        .withMessage("Age must be a whole number between 0 and 150")
        .toInt(),

    body("gender")
        .optional()
        .isIn(GENDERS)
        .withMessage(`Gender must be one of: ${GENDERS.join(", ")}`),

    body("bloodGroup")
        .optional()
        .isIn(BLOOD_GROUPS)
        .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(", ")}`),

    body("ward")
        .optional()
        .isString()
        .withMessage("Ward must be a string")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Ward name must be between 2 and 100 characters"),

    body("diagnosis")
        .optional()
        .isString()
        .withMessage("Diagnosis must be a string")
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage("Diagnosis must be between 2 and 1000 characters"),

    body("status")
        .optional()
        .isIn(PATIENT_STATUSES)
        .withMessage(`Status must be one of: ${PATIENT_STATUSES.join(", ")}`),

    body("admittedAt")
        .optional()
        .isISO8601()
        .withMessage("admittedAt must be a valid ISO 8601 date")
        .toDate()
        .custom((value) => {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            if (value > now) throw new Error("Admission date cannot be in the future");
            return true;
        }),

    body("dischargedAt")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("dischargedAt must be a valid ISO 8601 date")
        .toDate()
        .custom((value, { req }) => {
            if (req.body.admittedAt) {
                const admitted = new Date(req.body.admittedAt);
                if (value <= admitted) {
                    throw new Error("Discharge date must be after the admission date");
                }
            }
            return true;
        }),


    body().custom((body) => {
        const updatable = [
            "patientId", "doctorId", "name", "age", "gender",
            "bloodGroup", "ward", "diagnosis", "status",
            "admittedAt", "dischargedAt",
        ];
        if (!updatable.some((f) => body[f] !== undefined)) {
            throw new Error("At least one field must be provided to update the record");
        }
        return true;
    }),
];


const dischargePatientValidator = [
    param("id")
        .exists()
        .withMessage("Record ID is required")
        .isUUID()
        .withMessage("Record ID must be a valid UUID"),

    body("dischargedAt")
        .optional()
        .isISO8601()
        .withMessage("dischargedAt must be a valid ISO 8601 date")
        .toDate()
        .custom((value) => {
            if (value > new Date()) {
                throw new Error("Discharge date cannot be in the future");
            }
            return true;
        }),
];


const deletePatientRecordValidator = [
    param("id")
        .exists()
        .withMessage("Record ID is required")
        .isUUID()
        .withMessage("Record ID must be a valid UUID"),
];


const getPatientRecordByIdValidator = [
    param("id")
        .exists()
        .withMessage("Record ID is required")
        .isUUID()
        .withMessage("Record ID must be a valid UUID"),
];


const listPatientRecordsValidator = [
    query("ward")
        .optional()
        .isString()
        .withMessage("Ward filter must be a string")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Ward filter must not exceed 100 characters"),

    query("status")
        .optional()
        .isIn(PATIENT_STATUSES)
        .withMessage(`Status filter must be one of: ${PATIENT_STATUSES.join(", ")}`),

    query("gender")
        .optional()
        .isIn(GENDERS)
        .withMessage(`Gender filter must be one of: ${GENDERS.join(", ")}`),

    query("bloodGroup")
        .optional()
        .isIn(BLOOD_GROUPS)
        .withMessage(`Blood group filter must be one of: ${BLOOD_GROUPS.join(", ")}`),

    query("doctorId")
        .optional()
        .isUUID()
        .withMessage("doctorId filter must be a valid UUID"),

    query("search")
        .optional()
        .isString()
        .withMessage("Search must be a string")
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search query must not exceed 100 characters"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100")
        .toInt(),
];

module.exports = {
    createPatientRecordValidator,
    updatePatientRecordValidator,
    dischargePatientValidator,
    deletePatientRecordValidator,
    getPatientRecordByIdValidator,
    listPatientRecordsValidator,

    GENDERS,
    BLOOD_GROUPS,
    PATIENT_STATUSES,
    WARDS,
};