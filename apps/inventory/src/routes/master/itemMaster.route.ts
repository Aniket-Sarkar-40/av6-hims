import {
  ActiveItem,
  createItemMaster,
  getAllItemMaster,
  getBulkItemSupplierPrices,
  getItemMasterById,
  getItemStocksByItemId,
  itemExcelSampleExport,
  itemSearch,
  updateItemMaster,
} from "@/controllers/master/itemMaster.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { createUploadFieldsMiddleware } from "@/middlewares/imageUpload.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { validateBulkItemSupplierPrices } from "@/validations/request/itemSupplierMap/itemSupplierMap.validation";
import {
  validateGetItem,
  validateItemMasterCreate,
  validateItemMasterUpdate,
  validateItemSearch,
  validateItemStock,
} from "@/validations/request/master/itemMaster.validation";
import { Router } from "express";

export const itemMasterRouter = Router();

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
  verifyToken,
  authorize(getPermission("ITEM", "CREATE")),
  createUploadFieldsMiddleware("item", ["frontImage", "backImage", "leftSideImage", "rightSideImage"]),
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
itemMasterRouter.put("/active", verifyToken, authorize(getPermission("ITEM", "CREATE")), ActiveItem);

/**
 * @swagger
 * /api/v1/master/item-master:
 *   get:
 *     summary: Retrieve a list of Item Master
 *     tags: [Item Master]
 *     security:
 *       - bearerAuth: []
 */
itemMasterRouter.get("/", verifyToken, authorize(getPermission("ITEM", "VIEW")), getAllItemMaster);

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
itemMasterRouter.post("/id", verifyToken, authorize(getPermission("ITEM", "VIEW")), validateGetItem, getItemMasterById);

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
  verifyToken,
  authorize(getPermission("ITEM", "VIEW"), getPermission("ITEM", "UPDATE")),
  createUploadFieldsMiddleware("item", ["frontImage", "backImage", "leftSideImage", "rightSideImage"]),
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
  verifyToken,
  authorize(getPermission("ITEM_SEARCH", "CREATE")),
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
  verifyToken,
  authorize(getPermission("ITEMS_SUP", "VIEW")),
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
  verifyToken,
  authorize(getPermission("ITEM_BATCHES", "VIEW")),
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
itemMasterRouter.post("/export", verifyToken, authorize(getPermission("ITEM", "CREATE")), itemExcelSampleExport);
