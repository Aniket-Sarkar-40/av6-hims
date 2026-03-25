import {
  createIncome,
  deleteIncome,
  getAllIncome,
  getIncomeId,
  updateIncome,
} from "@/controllers/consumerConnect/income.controller.js";
import { authorize, verifyToken } from "@/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@/middlewares/imageUpload.middleware.js";
import { getPermission } from "@/utils/permissions.utils.js";
import { validateIncome, validateUpdateIncome } from "@/validations/request/consumerConnect/income.validation.js";
import { Router } from "express";

export const incomeRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Income
 *   description: Income  management endpoints
 */

/**
 * @swagger
 * /api/v1/income:
 *   post:
 *     summary: Create a new Income
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/incomeCreateSchema'
 */
incomeRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INCOME", "CREATE")),
  createUploadMiddleware("income", "documents"),
  validateIncome,
  createIncome
);

/**
 * @swagger
 * /api/v1/income:
 *   get:
 *     summary: Retrieve a list of Income
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 */
incomeRouter.get("/", verifyToken, authorize(getPermission("INCOME", "VIEW")), getAllIncome);

/**
 * @swagger
 * /api/v1/income/{incomeId}:
 *   get:
 *     summary: Retrieve a single Income  by ID
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incomeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The income ID.
 */
incomeRouter.get("/id", verifyToken, authorize(getPermission("INCOME", "VIEW")), getIncomeId);

/**
 * @swagger
 * /api/v1/income:
 *   put:
 *     summary: Update a Income 's details
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incomeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The income ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/incomeCreateSchema'
 */
incomeRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("INCOME", "VIEW"), getPermission("INCOME", "UPDATE")),
  createUploadMiddleware("income", "documents"),
  validateUpdateIncome,
  updateIncome
);

/**
 * @swagger
 * /api/v1/income:
 *   delete:
 *     summary: Delete
 *     tags: [Income]
 */
// DELETE/:shortCode/:id
incomeRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("INCOME", "VIEW"), getPermission("INCOME", "DELETE")),
  deleteIncome
);
