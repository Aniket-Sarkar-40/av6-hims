import {
  createOpdDepartmentPrefix,
  updateOpdDepartmentPreFix,
} from "@/controllers/master/opdDepartmentPrefix.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateOpdDepartmentPrefixCreate,
  validateOpdDepartmentPrefixUpdate,
} from "@/validations/request/master/opdDepartmentPrefix.validation.js";
import { Router } from "express";

export const opdDepartmentPrefixRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Opd Department Prefix
 *   description: OPD Department management endpoints
 */

/**
 * @swagger
 * /api/v1/master/opd-department-prefix:
 *   post:
 *     summary: Create a new OPD Department
 *     tags: [Opd Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentName:
 *                 type: string
 *               departmentType:
 *                 type: string
 *                 enum: [PRIMARY, SECONDARY]
 */
opdDepartmentPrefixRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "OPD_DEPARTMENT_PREFIX", "CREATE")),
  validateOpdDepartmentPrefixCreate,
  createOpdDepartmentPrefix,
);

/**
 * @swagger
 * /api/v1/master/opd-department-prefix:
 *   put:
 *     summary: Update an OPD Department
 *     tags: [Opd Department]
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
 *               departmentName:
 *                 type: string
 *               departmentType:
 *                 type: string
 *                 enum: [PRIMARY, SECONDARY]
 */
opdDepartmentPrefixRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "OPD_DEPARTMENT_PREFIX", "UPDATE")),
  validateOpdDepartmentPrefixUpdate,
  updateOpdDepartmentPreFix,
);
