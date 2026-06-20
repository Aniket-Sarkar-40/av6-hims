import {
  createMedicineTab,
  deleteMedicineTab,
  updateMedicineTab,
} from "@/controllers/appointment/medicineTab.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateMedicineTabCreate,
  validateMedicineTabUpdate,
} from "@/validations/request/appointment/medicineTab.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const medicineTabRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Medicine Tab
 *   description: Medicine Tab management endpoints
 */

/**
 * @swagger
 * /api/v1/master/medicine-tab:
 *   post:
 *     summary: Create a new Medicine Tab
 *     tags: [Medicine Tab]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: integer
 *               medTabName:
 *                 type: string
 */
medicineTabRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "MEDICINE_TAB", "CREATE")),
  validateMedicineTabCreate,
  createMedicineTab
);

/**
 * @swagger
 * /api/v1/master/medicine-tab:
 *   put:
 *     summary: Update an existing Medicine Tab
 *     tags: [Medicine Tab]
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
 *               doctorId:
 *                 type: integer
 *               medTabName:
 *                 type: string
 */
medicineTabRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "MEDICINE_TAB", "UPDATE")),
  validateMedicineTabUpdate,
  updateMedicineTab
);

/**
 * @swagger
 * /api/v1/master/medicine-tab/{id}:
 *   delete:
 *     summary: Delete a single Medicine Tab
 *     tags: [Medicine Tab]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the Medicine Tab to delete
 */

medicineTabRouter.delete(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "MEDICINE_TAB", "DELETE")),
  deleteMedicineTab
);
