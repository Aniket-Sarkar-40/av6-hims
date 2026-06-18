import {
  exportItemStockExcel,
  getAllItemBatchStock,
  getItemStock,
  getItemStockSummary,
} from "@/controllers/stock/itemStock.controller.js";
import {
  validateItemStockExcelExport,
  validateItemStockSearch,
} from "@/validations/request/stock/itemStock.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
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
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_STOCK_SUMMARY", "VIEW")),
  getItemStockSummary
);
/**
 * @swagger
 * /api/v1/master/item-Stock/search:
 *   post:
 *     summary: get Item Stock
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
  "/search",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_STOCK", "VIEW")),
  validateItemStockSearch,
  getItemStock
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
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_STOCK", "VIEW")),
  validateItemStockExcelExport,
  exportItemStockExcel
);

/**
 * @swagger
 * /api/v1/master/item-batch-stock:
 *   post:
 *     summary: Get all item batch stock
 *     tags: [Item Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemBatchStockLookupInputSchema'
 */
itemStockRouter.post(
  "/batch-stock",
  verifyToken,
  authorize(getPermission("INV", "ITEM_BATCH_STOCK", "VIEW")),
  getAllItemBatchStock
);
