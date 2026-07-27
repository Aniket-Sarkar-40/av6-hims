import {
  createClinicalHistory,
  updateClinicalHistory,
} from "@/controllers/appointment/clinicalHistory.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateClinicalHistoryCreate,
  validateClinicalHistoryUpdate,
} from "@/validations/request/appointment/clinicalHistory.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const clinicalHistoryRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Clinical History
 *   description: Clinical History management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/clinical-history:
 *   post:
 *     summary: Create a Clinical History
 *     tags: [Clinical History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/CreateClinicalHistorySchema'
 */
clinicalHistoryRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CLINICAL_HISTORY", "CREATE")),
  validateClinicalHistoryCreate,
  createClinicalHistory,
);

/**
 * @swagger
 * /api/v1/appointment/clinical-history:
 *   put:
 *     summary: Update a Clinical History
 *     tags: [Clinical History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateClinicalHistorySchema'
 */
clinicalHistoryRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "CLINICAL_HISTORY", "VIEW"),
    getPermission("OPD", "CLINICAL_HISTORY", "UPDATE"),
  ),
  validateClinicalHistoryUpdate,
  updateClinicalHistory,
);
