import {
  ActiveItem,
  allItemGet,
  deleteItem,
  excelItemReport,
  getItemById,
  getItemSellPricing,
  getItemStocksByItemId,
  getSlowMovingItem,
  itemCreate,
  itemExcelImport,
  itemExcelSampleExport,
  itemSearch,
  updateItem,
} from "@/controllers/item/item.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";

import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateItem,
  validateItemExcelFilter,
  validateItemSearch,
  validateItemStock,
  validateUpdateItem,
} from "@/validations/request/item/item.validation.js";
import { Router } from "express";
import {
  createUploadFieldsMiddleware,
  createUploadMiddleware,
} from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";

export const itemRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Item endpoints
 */

/**
 * @swagger
 * /api/v1/item:
 *   post:
 *     summary: Create a new Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createItemSchema'
 */
itemRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "CREATE")),
  createUploadFieldsMiddleware("item", [
    "barcode",
    "frontImage",
    "backImage",
    "leftSideImage",
    "rightSideImage",
  ]),
  validateCreateItem,
  itemCreate
);

/**
 * @swagger
 * /api/v1/item:
 *   put:
 *     summary: Update a Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemUpdateSchema'
 */
itemRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "ITEM", "VIEW"),
    getPermission("PMS", "ITEM", "UPDATE")
  ),
  createUploadFieldsMiddleware("item", [
    "barcode",
    "frontImage",
    "backImage",
    "leftSideImage",
    "rightSideImage",
  ]),
  validateUpdateItem,
  updateItem
);

/**
 * @swagger
 * /api/v1/item:
 *   get:
 *     summary: get all Items
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
itemRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "VIEW")),
  allItemGet
);

/**
 * @swagger
 * /api/v1/after-pricing:
 *   post:
 *     summary: get all Items
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
itemRouter.post(
  "/after-pricing",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "VIEW")),
  getItemSellPricing
);

/**
 * @swagger
 * /api/v1/item/id:
 *   post:
 *     summary: Retrieve a single Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getItemStockReqSchema'
 */
itemRouter.post(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "VIEW")),
  validateItemStock,
  getItemById
);

/**
 * @swagger
 * /api/v1/item/{id}:
 *   delete:
 *     summary: Delete a single Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
itemRouter.delete(
  "/:id",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "DELETE")),
  deleteItem
);

/**
 * @swagger
 * /api/v1/item/search:
 *   post:
 *     summary: Search Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemSearchSchema'
 */
itemRouter.post(
  "/search",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_SEARCH", "CREATE")),
  validateItemSearch,
  itemSearch
);

/**
 * @swagger
 * /api/v1/item/stock:
 *   post:
 *     summary: Search Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getItemStockReqSchema'
 */
itemRouter.post(
  "/stock",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_BATCHES", "VIEW")),
  validateItemStock,
  getItemStocksByItemId
);

/**
 * @swagger
 * /api/v1/item/slowMoving:
 *   get:
 *     summary: Get Slow Moving Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
itemRouter.get(
  "/slowMoving",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_SLOW_MOVING", "VIEW")),
  getSlowMovingItem
);

/**
 * @swagger
 * /api/v1/item/import:
 *   post:
 *     summary: Import excel data
 *     tags: [Common]
 */
// POST /importExcel
itemRouter.post(
  "/import",
  verifyToken,
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("PMS", "ITEM", "CREATE")),
  itemExcelImport
);

/**
 * @swagger
 * /api/v1/item/export:
 *   post:
 *     summary: Export excel data
 *     tags: [Common]
 */
// POST /export
itemRouter.post(
  "/export",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "CREATE")),
  itemExcelSampleExport
);

/**
 * @swagger
 * /api/v1/item/active/{id}:
 *   delete:
 *     summary: Delete a single Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
itemRouter.put(
  "/active/:id",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "CREATE")),
  ActiveItem
);

/**
 * @swagger
 * /api/v1/item/excel:
 *   post:
 *     summary: Get all Items in excel
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
// POST /item/excel
itemRouter.post(
  "/excel",
  verifyToken,
  authorize(getPermission("PMS", "ITEM", "VIEW")),
  validateItemExcelFilter,
  excelItemReport
);
