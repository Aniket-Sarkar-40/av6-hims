import {
  createMedicineTabDetails,
  getMedicineTabDetailsById,
  updateMedicineTabDetails,
} from "@/controllers/appointment/medicineTabDetails.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateMedicineTabDetailsCreate,
  validateMedicineTabDetailsUpdate,
} from "@/validations/request/appointment/medicineTabDetails.validation.js";
import { Router } from "express";

export const medicineTabDetailsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Medicine Tab Details
 *   description: Medicine Tab Details management endpoints
 */

/**
 * @swagger
 * /api/v1/master/medicine-tab-details:
 *   post:
 *     summary: Create new Medicine Tab Details
 *     tags: [Medicine Tab Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicineTabDetails'
 */
medicineTabDetailsRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "MEDICINE_TAB_DETAILS", "CREATE")),
  validateMedicineTabDetailsCreate,
  createMedicineTabDetails,
);

/**
 * @swagger
 * /api/v1/master/medicine-tab-details:
 *   put:
 *     summary: Update existing Medicine Tab Details
 *     tags: [Medicine Tab Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMedicineTabDetails'
 */
medicineTabDetailsRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("OPD", "MEDICINE_TAB_DETAILS", "VIEW"),
    getPermission("OPD", "MEDICINE_TAB_DETAILS", "UPDATE"),
  ),
  validateMedicineTabDetailsUpdate,
  updateMedicineTabDetails,
);

/**
 * @swagger
 * /api/v1/master/medicine-tab-details/by-id:
 *   post:
 *     summary: Get Medicine Tab Details by ID
 *     tags: [Medicine Tab Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Medicine Tab Details ID
 *               ccId:
 *                 type: integer
 *                 description: Collection Center ID
 *             required:
 *               - id
 *               - ccId
 */
medicineTabDetailsRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("OPD", "MEDICINE_TAB_DETAILS", "VIEW")),
  getMedicineTabDetailsById,
);
