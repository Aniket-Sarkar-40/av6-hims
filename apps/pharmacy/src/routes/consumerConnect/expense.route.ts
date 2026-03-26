import {
  createExpense,
  deleteExpense,
  getAllExpense,
  getExpenseById,
  updateExpense,
} from "@/controllers/consumerConnect/expense.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateExpenseSchema } from "@/validations/request/consumerConnect/expense.validation.js";

import { Router } from "express";
export const expenseRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Expense
 *   description: Expense management endpoints
 */
/**
 * @swagger
 * /api/v1/expense:
 *   post:
 *    summary: Create a new expense
 *    tags: [Expense]
 *    security:
 *      - bearerAuth: []
 *   requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/expenseSchema'
 * */
expenseRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE_HEAD", "CREATE")),
  createUploadMiddleware("documents"),
  validateExpenseSchema,
  createExpense,
);
/**
 * @swagger
 * /api/v1/expense:
 *   get:
 *     summary: Retrieve a list of expense
 *     tags: [Expense]
 *     security:
 *       - bearerAuth: []
 */
expenseRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE", "VIEW")),
  getAllExpense,
);

/**
 * @swagger
 * /api/v1/expense/{expenseId}:
 *   get:
 *     summary: Retrieve an expense by ID
 *     tags: [Expense]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the expense to retrieve
 *     responses:
 *       200:
 *         description: Success
 */

expenseRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE", "VIEW")),
  getExpenseById,
);
/**
 * @swagger
 * /api/v1/expense/:
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expense]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: expenseId
 *        required: true
 *        schema:
 *          type: integer
 *        description: The ID of the expense to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/expenseSchema '
 */
expenseRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "EXPENSE", "VIEW"),
    getPermission("PMS", "EXPENSE", "UPDATE"),
  ),
  createUploadMiddleware("documents"),
  validateExpenseSchema,
  updateExpense,
);
/**
 * @swagger
 * /api/v1/expense/:
 *   delete:
 *     summary: Delete a expense by ID
 *     tags: [Expense]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: number
 *         description: The expense ID to delete.
 */
expenseRouter.delete(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "EXPENSE", "VIEW"),
    getPermission("PMS", "EXPENSE", "DELETE"),
  ),
  deleteExpense,
);
