import {
  createPatientMedicine,
  deletePatientMedicine,
  getMedicines,
  getPatientMedicineById,
  updatePatientMedicine,
} from "@/controllers/appointment/patientMedicine.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreatePatientMedicine,
  validateSearchMedicine,
  validateUpdatePatientMedicine,
} from "@/validations/request/appointment/patientMedicine.validation.js";

import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const patientMedicineRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient Medicine
 *   description: patientMedicine endpoints
 */

/**
 * @swagger
 * /api/v1/patientMedicine:
 *   post:
 *     summary: Create a new patientMedicine
 *     tags: [Patient Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientMedicineSchema'
 */
patientMedicineRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_MEDICINE", "CREATE")),
  validateCreatePatientMedicine,
  createPatientMedicine
);

/**
 * @swagger
 * /api/v1/patientMedicine:
 *   put:
 *     summary: Update a patientMedicine
 *     tags: [Patient Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientMedicineUpdateSchema'
 */
patientMedicineRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "PATIENT_MEDICINE", "VIEW"),
    getPermission("OPD", "PATIENT_MEDICINE", "UPDATE")
  ),
  validateUpdatePatientMedicine,
  updatePatientMedicine
);

/**
 * @swagger
 * /api/v1/patientMedicine/id:
 *   get:
 *     summary: Retrieve a single patientMedicine
 *     tags: [Patient Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getPatientMedicineStockReqSchema'
 */
patientMedicineRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_MEDICINE", "VIEW")),
  getPatientMedicineById
);

/**
 * @swagger
 * /api/v1/patientMedicine:
 *   post:
 *     summary: Create a new patientMedicine
 *     tags: [Patient Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientMedicineSchema'
 */
patientMedicineRouter.post(
  "/search-medicine",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_MEDICINE", "CREATE")),
  validateSearchMedicine,
  getMedicines
);

/**
 * @swagger
 * /api/v1/patientMedicine/{id}:
 *   delete:
 *     summary: Delete a single Patient Medicine
 *     tags: [Patient Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the Patient Medicine to delete
 */

patientMedicineRouter.delete(
  "/delete",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATIENT_MEDICINE", "DELETE")),
  deletePatientMedicine
);
