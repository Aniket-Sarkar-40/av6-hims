import { Router } from "express";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  createStaffDesignation,
  deleteStaffDesignation,
  getAllStaffDesignations,
  getStaffDesignationById,
  updateStaffDesignation,
} from "@/controllers/staff/designation.controller.js";
import { validateStaffDesignation } from "@/validations/request/staff/designation.validation.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

const staffDesignationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Staff Designation
 *   description: Staff Designation management endpoints
 */

/**
 * @swagger
 * /api/v1/staffDesignation:
 *   post:
 *     summary: Create a new staffDesignation
 *     tags: [Staff Designation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/staffDesignationSchema'
 */
staffDesignationRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_DESIGNATION", "CREATE")),
  validateStaffDesignation,
  createStaffDesignation,
);

/**
 * @swagger
 * /api/v1/staffDesignation:
 *   get:
 *     summary: Retrieve a list of staffDesignations
 *     tags: [Staff Designation]
 *     security:
 *       - bearerAuth: []
 */
staffDesignationRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_DESIGNATION", "VIEW")),
  getAllStaffDesignations,
);

/**
 * @swagger
 * /api/v1/staffDesignation/{staffDesignationId}:
 *   get:
 *     summary: Retrieve a single staffDesignation by ID
 *     tags: [Staff Designation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffDesignationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffDesignation ID.
 */
staffDesignationRouter.get(
  "/:staffDesignationId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_DESIGNATION", "VIEW")),
  getStaffDesignationById,
);

/**
 * @swagger
 * /api/v1/staffDesignation/{staffDesignationId}:
 *   put:
 *     summary: Update a staffDesignation's details
 *     tags: [Staff Designation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffDesignationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffDesignation ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/staffDesignationSchema'
 */
staffDesignationRouter.put(
  "/:staffDesignationId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "STAFF_DESIGNATION", "VIEW"),
    getPermission("PMS", "STAFF_DESIGNATION", "UPDATE"),
  ),
  validateStaffDesignation,
  updateStaffDesignation,
);

/**
 * @swagger
 * /api/v1/staffDesignation/{staffDesignationId}:
 *   delete:
 *     summary: Delete a staffDesignation
 *     tags: [Staff Designation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffDesignationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The staffDesignation ID to delete.
 */
staffDesignationRouter.delete(
  "/:staffDesignationId",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STAFF_DESIGNATION", "DELETE")),
  deleteStaffDesignation,
);

export default staffDesignationRouter;
