import {
  createExpenseHead,
  deleteExpenseHead,
  getAllExpenseHeads,
  getExpenseHeadById,
  updateExpenseHead,
} from "@/controllers/master/expenseHead.controller.js";
import {
  validateExpenseHeadCreate,
  validateExpenseHeadUpdate,
} from "@/validations/request/master/expenseHead.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const expenseHeadRouter: Router = Router();
/**
 * @swagger
 * tags:
 *   name: ExpenseHead
 *   description: Expense Head management endpoints
 */
/**
 * @swagger
 * /api/v1/expense-head:
 *   post:
 *     summary: Create a new expense head
 *     tags:
 *       - ExpenseHead
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/expenseHeadCreateSchema'
 */

expenseHeadRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE_HEAD", "CREATE")),
  validateExpenseHeadCreate,
  createExpenseHead
);
/**
 * @swagger
 * /api/v1/expense-head:
 *   get:
 *     summary: Retrieve a list of expense heads
 *     tags: [ExpenseHead]
 *     security:
 *       - bearerAuth: []
 */
expenseHeadRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE_HEAD", "VIEW")),
  getAllExpenseHeads
);

/**
 * @swagger
 * /api/v1/expense-head/{expenseHeadId}:
 *   get:
 *     summary: Retrieve an expense head by ID
 *     tags: [ExpenseHead]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseHeadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the expense head to retrieve
 *     responses:
 *       200:
 *         description: Success
 */

expenseHeadRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE_HEAD", "VIEW")),
  getExpenseHeadById
);
/**
 * @swagger
 * /api/v1/expense-head:
 *   put:
 *     summary: Update an existing expense head
 *     tags: [ExpenseHead]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: expenseHeadId
 *        required: true
 *        schema:
 *          type: integer
 *        description: The ID of the expense head to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/expenseHeadUpdateSchema '
 */
expenseHeadRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "EXPENSE_HEAD", "VIEW"),
    getPermission("PMS", "EXPENSE_HEAD", "UPDATE")
  ),
  validateExpenseHeadUpdate,
  updateExpenseHead
);
/**
 * @swagger
 * /api/v1/expense-head/{expenseHeadId}:
 *   delete:
 *     summary: Delete a expense head by ID
 *     tags: [ExpenseHead]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseHeadId
 *         required: true
 *         schema:
 *           type: number
 *         description: The expenseHead ID to delete.
 */
expenseHeadRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "EXPENSE_HEAD", "DELETE")),
  deleteExpenseHead
);

export default expenseHeadRouter;
