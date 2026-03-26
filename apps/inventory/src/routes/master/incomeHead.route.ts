import {
  createIncomeHead,
  deleteIncomeHead,
  getAllIncomeHead,
  getIncomeHeadId,
  updateIncomeHead,
} from "@/controllers/master/incomeHead.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateIncomeHeadCreate,
  validateIncomeHeadUpdate,
} from "@/validations/request/master/incomeHead.validation.js";
import { Router } from "express";

export const incomeHeadRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Income Head
 *   description: Income Head management endpoints
 */

/**
 * @swagger
 * /api/v1/income-head:
 *   post:
 *     summary: Create a new Income Head
 *     tags: [Income Head]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/incomeHeadCreateSchema'
 */
incomeHeadRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INV", "INCOME_HEAD", "CREATE")),
  validateIncomeHeadCreate,
  createIncomeHead,
);

/**
 * @swagger
 * /api/v1/income-head:
 *   get:
 *     summary: Retrieve a list of Income Head
 *     tags: [Income Head]
 *     security:
 *       - bearerAuth: []
 */
incomeHeadRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("INV", "INCOME_HEAD", "VIEW")),
  getAllIncomeHead,
);

/**
 * @swagger
 * /api/v1/income-head/{incomeHeadId}:
 *   get:
 *     summary: Retrieve a single Income Head by ID
 *     tags: [Income Head]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incomeHeadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The incomeHead ID.
 */
incomeHeadRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("INV", "INCOME_HEAD", "VIEW")),
  getIncomeHeadId,
);

/**
 * @swagger
 * /api/v1/income-head:
 *   put:
 *     summary: Update a Income Head's details
 *     tags: [Income Head]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incomeHeadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The incomeHead ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/incomeHeadUpdateSchema'
 */
incomeHeadRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("INV", "INCOME_HEAD", "VIEW"),
    getPermission("INV", "INCOME_HEAD", "UPDATE"),
  ),
  validateIncomeHeadUpdate,
  updateIncomeHead,
);

/**
 * @swagger
 * /api/v1/income-head:
 *   delete:
 *     summary: Delete a income head
 *     tags: [Income Head]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incomeHeadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Income Head ID to delete.
 */
incomeHeadRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("INV", "INCOME_HEAD", "DELETE")),
  deleteIncomeHead,
);
