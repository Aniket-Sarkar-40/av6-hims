import {
  createStaffCollectionCenter,
  deleteStaffCollectionCenter,
  getStaffCollectionCenterById,
  getStaffCollectionCenterMapById,
  updateStaffCollectionCenter,
} from "@/controllers/staff/staffCollectionCenter.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateStaffCollectionCenter } from "@/validations/request/staff/staffCollectionCenter.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const staffCollectionCenterRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Staff Collection Center
 *   description: staffCollectionCenter management endpoints
 */

/**
 * @swagger
 * /api/v1/staffCollectionCenter:
 *   post:
 *     summary: Create a new staffCollectionCenter
 *     tags: [Staff Collection Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createOrUpdateStaffCollectionCenterSchema'
 */
// POST /staffCollectionCenters
staffCollectionCenterRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_COLLECTION_CENTER", "CREATE")),
  validateStaffCollectionCenter,
  createStaffCollectionCenter,
);

/**
 * @swagger
 * /api/v1/staffCollectionCenter/{staffCollectionCenterId}:
 *   get:
 *     summary: Retrieve a single staffCollectionCenter by ID.
 *     tags: [Staff Collection Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffCollectionCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffCollectionCenter ID.
 */
// GET /staffCollectionCenters/:staffCollectionCenterId
staffCollectionCenterRouter.get(
  "/:staffCollectionCenterId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_COLLECTION_CENTER", "VIEW")),
  getStaffCollectionCenterById,
);

/**
 * @swagger
 * /api/v1/staffCollectionCenter/{staffId}:
 *   get:
 *     summary: Retrieve a single staffCollectionCenter by ID.
 *     tags: [Staff Collection Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffCollectionCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffCollectionCenter ID.
 */
// GET /staffCollectionCenters/:staffCollectionCenterId
staffCollectionCenterRouter.get(
  "/id/:staffId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_COLLECTION_CENTER", "VIEW")),
  getStaffCollectionCenterMapById,
);

/**
 * @swagger
 * /api/v1/staffCollectionCenter/{staffCollectionCenterId}:
 *   put:
 *     summary: Update an staffCollectionCenter's details.
 *     tags: [Staff Collection Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffCollectionCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffCollectionCenter ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createOrUpdateStaffCollectionCenterSchema'
 */
// PUT /staffCollectionCenters/:staffCollectionCenterId
staffCollectionCenterRouter.put(
  "/:staffCollectionCenterId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "STAFF_COLLECTION_CENTER", "VIEW"),
    getPermission("PMS", "STAFF_COLLECTION_CENTER", "UPDATE"),
  ),
  validateStaffCollectionCenter,
  updateStaffCollectionCenter,
);

/**
 * @swagger
 * /api/v1/staffCollectionCenter/{staffCollectionCenterId}:
 *   delete:
 *     summary: Delete an staffCollectionCenter.
 *     tags: [Staff Collection Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffCollectionCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffCollectionCenter ID to delete.
 */
// DELETE /staffCollectionCenters/:staffCollectionCenterId
staffCollectionCenterRouter.delete(
  "/:staffCollectionCenterId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_COLLECTION_CENTER", "DELETE")),
  deleteStaffCollectionCenter,
);
