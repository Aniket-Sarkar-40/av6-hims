import {
  createItemSupplier,
  deleteItemSupplierById,
  getAllItemSupplier,
  getItemSupplierById,
  itemSupplierExcelImport,
  itemSupplierExcelSampleExport,
  searchItemSupplier,
  updateItemSupplier,
} from "@/controllers/master/itemSupplier.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateItemSupplier,
  validateItemSupplierLookup,
  validateUpdateItemSupplier,
} from "@/validations/request/master/itemSupplier.validation.js";

import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";

export const itemSupplierRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item Supplier
 *   description: Item Supplier management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-supplier:
 *   post:
 *     summary: Create a new Item Supplier
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemSupplierCreateSchema'
 */
itemSupplierRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "CREATE")),
  validateCreateItemSupplier,
  createItemSupplier,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   put:
 *     summary: Update a Item Supplier's details
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemSupplierUpdateSchema'
 */
itemSupplierRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "UPDATE")),
  validateUpdateItemSupplier,
  updateItemSupplier,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   get:
 *     summary: Retrieve all Item Supplier
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 */
itemSupplierRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "VIEW")),
  getAllItemSupplier,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   get:
 *     summary: Retrieve single Item Supplier
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemSupplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Item Supplier ID.
 */

itemSupplierRouter.get(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "VIEW")),
  getItemSupplierById,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   get:
 *     summary: Delete Item Supplier by ID
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemSupplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Item Supplier ID.
 */

itemSupplierRouter.delete(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "DELETE")),
  deleteItemSupplierById,
);

/**
 * @swagger
 * /api/v1/master/item-supplier/excel-sample-export:
 *   get:
 *     summary: Export excel sample data
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 */
itemSupplierRouter.get(
  "/excel-sample-export",
  verifyToken,
  authorize(getPermission("INV", "ITEM_SUPPLIER", "VIEW")),
  itemSupplierExcelSampleExport,
);

itemSupplierRouter.post(
  "/import",
  verifyToken,
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "CREATE")),
  itemSupplierExcelImport,
);

/**
 * @swagger
 * /api/v1/master/item-supplier/search:
 *   post:
 *     summary: Search item suppliers by code, name, email, or phone
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - searchText
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CODE, NAME, EMAIL, PHONE]
 *               searchText:
 *                 type: string
 */
itemSupplierRouter.post(
  "/search",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER", "VIEW")),
  validateItemSupplierLookup,
  searchItemSupplier,
);
