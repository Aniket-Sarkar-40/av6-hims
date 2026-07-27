import {
  createPatientConsultation,
  updatePatientConsultation,
} from "@/controllers/appointment/patientConsultation.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validatePatientConsultationCreate,
  validatePatientConsultationUpdate,
} from "@/validations/request/appointment/patientConsultation.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const patientConsultationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient Consultation
 *   description: Patient Consultation management endpoints
 */

/**
 * @swagger
 * /api/v1//appointments/patient-:
 *   post:
 *     summary: Create a  Patient Consultation
 *     tags: [Patient Consultation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientConsultationCreateSchema'
 */
patientConsultationRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_CONSULTATION", "CREATE")),
  validatePatientConsultationCreate,
  createPatientConsultation,
);

/**
 * @swagger
 * /api/v1/appointment/patient-consultation:
 *   post:
 *     summary: Update a  Patient Consultation
 *     tags: [Patient Consultation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientConsultationUpdateSchema'
 */
patientConsultationRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_CONSULTATION", "UPDATE")),
  validatePatientConsultationUpdate,
  updatePatientConsultation,
);
