import {
  createOpdDepartment,
  updateOpdDepartment,
} from "@/controllers/master/opdDepartment.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateOpdDepartmentCreate,
  validateOpdDepartmentUpdate,
} from "@/validations/request/master/opdDepartment.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const opdDepartmentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Opd Department
 *   description: OPD Department management endpoints
 */

/**
 * @swagger
 * /api/v1/master/opd-department:
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
opdDepartmentRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "OPD_DEPARTMENT", "CREATE")),
  validateOpdDepartmentCreate,
  createOpdDepartment,
);

/**
 * @swagger
 * /api/v1/master/opd-department:
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
opdDepartmentRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "OPD_DEPARTMENT", "UPDATE")),
  validateOpdDepartmentUpdate,
  updateOpdDepartment,
);
