import { Router } from "express";
import { verifyToken, authorize } from "@/middlewares/auth.middleware";
import { validateCurrency, validateUpdateCurrency } from "@/validations/request/master/currency.validation";
import {
  createCurrency,
  deleteCurrency,
  getAllCurrency,
  getCurrencyById,
  updateCurrency,
} from "@/controllers/master/currency.controller";
import { getPermission } from "@/utils/permissions.utils";

const currencyRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: currency management endpoints
 */

/**
 * @swagger
 * /api/v1/currency:
 *   post:
 *     summary: Create a new currency
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/currencySchema'
 */
currencyRouter.post("/", verifyToken, authorize(getPermission("CURRENCY", "CREATE")), validateCurrency, createCurrency);

/**
 * @swagger
 * /api/v1/currency:
 *   get:
 *     summary: Retrieve a list of currency
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 */
currencyRouter.get("/", verifyToken, authorize(getPermission("CURRENCY", "VIEW")), getAllCurrency);

/**
 * @swagger
 * /api/v1/currency/{currencyId}:
 *   get:
 *     summary: Retrieve a single currency by ID
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The currency ID.
 */
currencyRouter.get("/:currencyId", verifyToken, authorize(getPermission("CURRENCY", "VIEW")), getCurrencyById);

/**
 * @swagger
 * /api/v1/currency/{currencyId}:
 *   put:
 *     summary: Update a currency's details
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The currency ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/currencyUpdateSchema'
 */
currencyRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("CURRENCY", "VIEW"), getPermission("CURRENCY", "UPDATE")),
  validateUpdateCurrency,
  updateCurrency
);

/**
 * @swagger
 * /api/v1/currency/{currencyId}:
 *   delete:
 *     summary: Delete a currency
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The currency ID to delete.
 */
currencyRouter.delete("/:currencyId", verifyToken, authorize(getPermission("CURRENCY", "DELETE")), deleteCurrency);

export default currencyRouter;
