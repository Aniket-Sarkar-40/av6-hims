import { Router } from "express";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  validateCurrency,
  validateUpdateCurrency,
} from "@/validations/request/master/currency.validation.js";
import {
  createCurrency,
  deleteCurrency,
  getAllCurrency,
  getCurrencyById,
  updateCurrency,
} from "@/controllers/master/currency.controller.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

const currencyRouter: Router = Router();

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
currencyRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CURRENCY", "CREATE")),
  validateCurrency,
  createCurrency,
);

/**
 * @swagger
 * /api/v1/currency:
 *   get:
 *     summary: Retrieve a list of currency
 *     tags: [Currency]
 *     security:
 *       - bearerAuth: []
 */
currencyRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CURRENCY", "VIEW")),
  getAllCurrency,
);

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
currencyRouter.get(
  "/:currencyId",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CURRENCY", "VIEW")),
  getCurrencyById,
);

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
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "CURRENCY", "VIEW"),
    getPermission("INV", "CURRENCY", "UPDATE"),
  ),
  validateUpdateCurrency,
  updateCurrency,
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
currencyRouter.delete(
  "/:currencyId",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CURRENCY", "DELETE")),
  deleteCurrency,
);

export default currencyRouter;
