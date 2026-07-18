import {
  createPatientAdviceDetails,
  getPatientAdviceDetailsByAppointmentId,
} from "@/controllers/appointment/patientAdviceDetails.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validatePatientAdviceDetailsCreate } from "@/validations/request/appointment/patientAdviceDetails.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const patientAdviceDetailsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient Advice Details
 *   description: Patient Advice Details management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/patient-advice-details:
 *   post:
 *     summary: Create a  Patient Advice Details
 *     tags: [Patient Advice Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientAdviceDetailsCreateSchema'
 */
patientAdviceDetailsRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_ADVICE_DETAILS", "CREATE")),
  validatePatientAdviceDetailsCreate,
  createPatientAdviceDetails,
);

/**
 * @swagger
 * /api/v1/appointment/patient-advice-details/appointmentId:
 *   post:
 *     summary:  Patient Advice Details by appointment Id
 *     tags: [Patient Advice Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - patientId
 *             properties:
 *               appointmentId:
 *                 type: number
 *               patientId:
 *                 type: number
 */
patientAdviceDetailsRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_ADVICE_DETAILS", "VIEW")),
  getPatientAdviceDetailsByAppointmentId,
);
