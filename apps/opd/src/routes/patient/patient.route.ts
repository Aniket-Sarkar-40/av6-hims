import {
  createPatients,
  deletePatients,
  getAllPatients,
  getPatientsById,
  updatePatients,
} from "@/controllers/patient/patient.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadFieldsMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validatePatients,
  validatePatientsUpdate,
} from "@/validations/request/patient/patient.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const patientsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: patients endpoints
 */

/**
 * @swagger
 * /api/v1/patients:
 *   post:
 *     summary: Create a new patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientsSchema'
 */
patientsRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT", "CREATE")),
  createUploadFieldsMiddleware("patient_images/patient_captured_images", [
    "image",
    "patientImage",
    "patientSignature",
  ]),
  validatePatients,
  createPatients,
);

/**
 * @swagger
 * /api/v1/patients:
 *   put:
 *     summary: Update a patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientsSchemaUpdate'
 */
patientsRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "PATIENT", "VIEW"),
    getPermission("OPD", "PATIENT", "UPDATE"),
  ),
  createUploadFieldsMiddleware("patient_images/patient_captured_images", [
    "image",
    "patientImage",
    "patientSignature",
  ]),
  validatePatientsUpdate,
  updatePatients,
);

/**
 * @swagger
 * /api/v1/patients:
 *   get:
 *     summary: get all patientss
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
patientsRouter.get(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT", "VIEW")),
  getAllPatients,
);

/**
 * @swagger
 * /api/v1/patients/id:
 *   post:
 *     summary: Retrieve a single patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getPatientsStockReqSchema'
 */
patientsRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT", "VIEW")),
  getPatientsById,
);

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   delete:
 *     summary: Delete a single patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
patientsRouter.delete(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT", "DELETE")),
  deletePatients,
);
