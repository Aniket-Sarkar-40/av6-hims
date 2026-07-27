import {
  createPatientProcedure,
  returnPatientProcedure,
  updatePatientProcedure,
} from "@/controllers/appointment/patientProcedure.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreatePatientProcedure,
  validateReturnPatientProcedure,
  validateUpdatePatientProcedure,
} from "@/validations/request/appointment/patientProcedure.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const patientProcedureRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient Procedure
 *   description: Patient Procedure management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/patient-procedure:
 *   post:
 *     summary: Create a new Patient Procedure
 *     tags: [Patient Procedure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientProcedureCreateInput'
 */

patientProcedureRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_PROCEDURE", "CREATE")),
  validateCreatePatientProcedure,
  createPatientProcedure,
);

/**
 * @swagger
 * /api/v1/appointment/patient-procedure:
 *   put:
 *     summary: Update a Patient Procedure
 *     tags: [Patient Procedure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientProcedureUpdateInput'
 */

patientProcedureRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "PATIENT_PROCEDURE", "UPDATE"),
    getPermission("OPD", "PATIENT_PROCEDURE", "VIEW"),
  ),
  validateUpdatePatientProcedure,
  updatePatientProcedure,
);

/**
 * @swagger
 * /api/v1/appointment/patient-procedure/return:
 *   put:
 *     summary: Return a Patient Procedure
 *     tags: [Patient Procedure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientProcedureReturnInput'
 */
patientProcedureRouter.put(
  "/return",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "PATIENT_PROCEDURE", "UPDATE"),
    getPermission("OPD", "PATIENT_PROCEDURE", "VIEW"),
  ),
  validateReturnPatientProcedure,
  returnPatientProcedure,
);
