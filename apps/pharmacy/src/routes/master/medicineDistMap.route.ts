import {
  createMedicineDistMap,
  updateMedicineDistMap,
} from "@/controllers/master/medicineDistMap.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateMedicineDistMap,
  validateMedicineDistMapUpdate,
} from "@/validations/request/master/medicineDistMapReq.validation.js";

import { Router } from "express";

const medicineDistMapRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Medicine Distributor Map
 *   description: Medicine Distributor Map management endpoints
 */

/**
 * @swagger
 * /api/v1/master/medicine-dist-map:
 *   post:
 *     summary: Create a new Medicine Distributor Map
 *     tags: [Medicine Distributor Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/medicineDistMapSchema'
 */
medicineDistMapRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "MEDICINE_DIST_MAP", "CREATE")),
  validateMedicineDistMap,
  createMedicineDistMap,
);

/**
 * @swagger
 * /api/v1/master/medicine-dist-map:
 *   put:
 *     summary: Update a Medicine Distributor Map's details
 *     tags: [Medicine Distributor Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicineDistMapId
 *         required: true
 *         schema:
 *           type: string
 *         description: The medicineDistMap ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/medicineDistMapSchemaUpdate'
 */
medicineDistMapRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "MEDICINE_DIST_MAP", "VIEW"),
    getPermission("PMS", "MEDICINE_DIST_MAP", "UPDATE"),
  ),
  validateMedicineDistMapUpdate,
  updateMedicineDistMap,
);

export default medicineDistMapRouter;
