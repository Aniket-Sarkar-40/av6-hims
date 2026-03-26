import {
  exportItemStockExcel,
  getItemStock,
  getItemStockSummary,
} from "@/controllers/stock/itemStock.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const itemStockRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item Stock
 *   description: Item Stock management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-Stock-summary:
 *   post:
 *     summary: Create a new Item Stock
 *     tags: [Item Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemStockSchema'
 */
itemStockRouter.post(
  "/summary",
  verifyToken,
  authorize(getPermission("INV", "ITEM_STOCK_SUMMARY", "VIEW")),
  getItemStockSummary,
);
/**
 * @swagger
 * /api/v1/master/item-Stock:
 *   post:
 *     summary: Create a new Item Stock
 *     tags: [Item Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemStockSchema'
 */
itemStockRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INV", "ITEM_STOCK", "VIEW")),
  getItemStock,
);

/**
 * @swagger
 * /api/v1/master/item-Stock/export-excel:
 *   get:
 *     summary: Export Item Stock to Excel
 *     tags: [Item Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ccId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Collection Center ID
 */
itemStockRouter.post(
  "/export-excel",
  verifyToken,
  authorize(getPermission("INV", "ITEM_STOCK", "VIEW")),
  exportItemStockExcel,
);
