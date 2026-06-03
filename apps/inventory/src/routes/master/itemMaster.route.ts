import {
  ActiveItem,
  createItemMaster,
  getAllItemMaster,
  getBulkItemSupplierPrices,
  getItemMasterById,
  getItemStocksByItemId,
  importItemMasterExcel,
  itemExcelExport,
  itemExcelSampleExport,
  itemSearch,
  updateItemMaster,
} from "@/controllers/master/itemMaster.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  createUploadFieldsMiddleware,
  createUploadMiddleware,
} from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateBulkItemSupplierPrices } from "@/validations/request/itemSupplierMap/itemSupplierMap.validation.js";
import {
  validateGetItem,
  validateItemMasterCreate,
  validateItemMasterUpdate,
  validateItemSearch,
  validateItemStock,
} from "@/validations/request/master/itemMaster.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";

export const itemMasterRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item Master
 *   description: Item Master management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-master:
 *   post:
 *     summary: Create a new Item Master
 *     tags: [Item Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemMasterSchema'
 */
itemMasterRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_MASTER", "CREATE")),
  createUploadFieldsMiddleware("item", [
    "frontImage",
    "backImage",
    "leftSideImage",
    "rightSideImage",
  ]),
  validateItemMasterCreate,
  createItemMaster
);

/**
 * @swagger
 * /api/v1/item-master/active:
 *   delete:
 *     summary: Delete a single Item
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 */
itemMasterRouter.put(
  "/active",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_MASTER", "CREATE")),
  ActiveItem
);

/**
 * @swagger
 * /api/v1/master/item-master:
 *   get:
 *     summary: Retrieve a list of Item Master
 *     tags: [Item Master]
 *     security:
 *       - bearerAuth: []
 */
itemMasterRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_MASTER", "VIEW")),
  getAllItemMaster
);

/**
 * @swagger
 * /api/v1/master/item-master/id:
 *   get:
 *     summary: Retrieve a single Item Master
 *     tags: [Item Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
itemMasterRouter.post(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_MASTER", "VIEW")),
  validateGetItem,
  getItemMasterById
);

/**
 * @swagger
 * /api/v1/master/item-master:
 *   put:
 *     summary: Update a Item Master's details
 *     tags: [Item Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemMasterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The itemMaster ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemMasterSchemaUpdate'
 */
itemMasterRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "ITEM_MASTER", "VIEW"),
    getPermission("INV", "ITEM_MASTER", "UPDATE")
  ),
  createUploadFieldsMiddleware("item", [
    "frontImage",
    "backImage",
    "leftSideImage",
    "rightSideImage",
  ]),
  validateItemMasterUpdate,
  updateItemMaster
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
itemMasterRouter.post(
  "/search",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SEARCH", "CREATE")),
  validateItemSearch,
  itemSearch
);

/**
 * @swagger
 * /api/v1/master/item/items:
 *   post:
 *     summary: Get supplier-specific prices for multiple items
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplierId, itemIds]
 *             properties:
 *               supplierId:
 *                 type: number
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: number
 *               ccId:
 *                 type: number
 */
itemMasterRouter.post(
  "/items",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEMS_SUP", "VIEW")),
  validateBulkItemSupplierPrices,
  getBulkItemSupplierPrices
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
itemMasterRouter.post(
  "/stock",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_BATCHES", "VIEW")),
  validateItemStock,
  getItemStocksByItemId
);

/**
 * @swagger
 * /api/v1/item/export:
 *   post:
 *     summary: Export excel data
 *     tags: [Common]
 */
// POST /export
itemMasterRouter.get(
  "/export",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_MASTER", "CREATE")),
  itemExcelSampleExport
);

/**
 * @swagger
 * /api/v1/item/excel-export:
 *   post:
 *     summary: Export excel data
 *     tags: [Common]
 */
// POST /export
itemMasterRouter.get(
  "/item-excel-export",
  verifyToken,
  authorize(getPermission("INV", "ITEM", "CREATE")),
  itemExcelExport
);

itemMasterRouter.post(
  "/import",
  verifyToken,
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("INV", "ITEM", "CREATE")),
  importItemMasterExcel
);
