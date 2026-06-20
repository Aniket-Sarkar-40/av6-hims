import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByIdWithCache,
  updateEmployee,
} from "@/controllers/staff/employee.controller.js";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateEmployee } from "@/validations/request/staff/employee.validation.js";

export const employeeRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /api/v1/employee:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/employeeSchema'
 */
// POST /Employees
employeeRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "EMPLOYEE", "CREATE")),
  validateEmployee,
  createEmployee
);

/**
 * @swagger
 * /api/v1/employee:
 *   get:
 *     summary: Retrieve a list of employees.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 */
// GET /Employees
employeeRouter.get(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "EMPLOYEE", "VIEW")),
  getAllEmployees
);

/**
 * @swagger
 * /api/v1/employee/{employeeId}:
 *   get:
 *     summary: Retrieve a single employee by ID.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID.
 */
// GET /Employees/:EmployeeId
employeeRouter.get(
  "/:employeeId",
  verifyToken(),
  authorize(getPermission("CORE", "EMPLOYEE", "VIEW")),
  getEmployeeById
);

/**
 * @swagger
 * /api/v1/employee/{employeeId}:
 *   put:
 *     summary: Update an employee's details.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/employeeSchema'
 */
// PUT /Employees/:EmployeeId
employeeRouter.put(
  "/:employeeId",
  verifyToken(),
  authorize(
    getPermission("CORE", "EMPLOYEE", "VIEW"),
    getPermission("CORE", "EMPLOYEE", "UPDATE")
  ),
  validateEmployee,
  updateEmployee
);

/**
 * @swagger
 * /api/v1/employee/{employeeId}:
 *   delete:
 *     summary: Delete an employee.
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID to delete.
 */
// DELETE /Employees/:EmployeeId
employeeRouter.delete(
  "/:employeeId",
  verifyToken(),
  authorize(getPermission("CORE", "EMPLOYEE", "DELETE")),
  deleteEmployee
);

employeeRouter.get(
  "/cache/:employeeId",
  verifyToken(),
  authorize(getPermission("CORE", "EMPLOYEE", "VIEW")),
  getEmployeeByIdWithCache
);

export default employeeRouter;
