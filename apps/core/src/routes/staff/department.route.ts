import { Router } from "express";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateDepartment } from "@/validations/request/staff/department.validation.js";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from "@/controllers/staff/department.controller.js";

export const departmentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Department management endpoints
 */

/**
 * @swagger
 * /api/v1/department:
 *   post:
 *     summary: Create a new Department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/departmentSchema'
 */
departmentRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "DEPARTMENT", "CREATE")),
  validateDepartment,
  createDepartment
);

/**
 * @swagger
 * /api/v1/department:
 *   get:
 *     summary: Retrieve a list of departments
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 */
departmentRouter.get(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "DEPARTMENT", "VIEW")),
  getAllDepartments
);

/**
 * @swagger
 * /api/v1/department/{departmentId}:
 *   get:
 *     summary: Retrieve a single Department by ID
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Department ID.
 */
departmentRouter.get(
  "/:departmentId",
  verifyToken(),
  authorize(getPermission("CORE", "DEPARTMENT", "VIEW")),
  getDepartmentById
);

/**
 * @swagger
 * /api/v1/department/{departmentId}:
 *   put:
 *     summary: Update a Department's details
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Department ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/departmentSchema'
 */
departmentRouter.put(
  "/:departmentId",
  verifyToken(),
  authorize(
    getPermission("CORE", "DEPARTMENT", "VIEW"),
    getPermission("CORE", "DEPARTMENT", "UPDATE")
  ),
  validateDepartment,
  updateDepartment
);

/**
 * @swagger
 * /api/v1/department/{departmentId}:
 *   delete:
 *     summary: Delete a Department
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Department ID to delete.
 */
departmentRouter.delete(
  "/:departmentId",
  verifyToken(),
  authorize(getPermission("CORE", "DEPARTMENT", "DELETE")),
  deleteDepartment
);

export default departmentRouter;
