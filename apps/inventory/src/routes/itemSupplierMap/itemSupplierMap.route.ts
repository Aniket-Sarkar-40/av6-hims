import {
  createItemSupplierMap,
  deleteItemSupplierMapById,
  exportItemSupplierMapExcel,
  getAllItemSupplierMap,
  getItemSupplierMapById,
  importItemSupplierMapExcel,
  updateItemSupplierMap,
} from "@/controllers/itemSupplierMap/itemSupplierMap.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateItemSupplierMap,
  validateImportExcelItemSupplierMap,
  validateUpdateItemSupplierMap,
} from "@/validations/request/itemSupplierMap/itemSupplierMap.validation.js";
import { Router } from "express";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const itemSupplierMapRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item Supplier Mapping
 *   description: Item Supplier Mapping management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-supplier-mapping:
 *   post:
 *     summary: Create a new Item Supplier Mapping
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemSupplierCreateSchema'
 */
itemSupplierMapRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "CREATE")),
  validateCreateItemSupplierMap,
  createItemSupplierMap,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier-mapping:
 *   put:
 *     summary: Update a Item Supplier Mapping
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemSupplierUpdateSchema'
 */
itemSupplierMapRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "UPDATE")),
  validateUpdateItemSupplierMap,
  updateItemSupplierMap,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier-mapping:
 *   get:
 *     summary: Retrieve all Item Supplier Mapping
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 */
itemSupplierMapRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "VIEW")),
  getAllItemSupplierMap,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier-mapping/id:
 *   get:
 *     summary: Retrieve single Item Supplier Mapping
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemSupplierMapId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Item Supplier Mapping ID.
 */

itemSupplierMapRouter.get(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "VIEW")),
  getItemSupplierMapById,
);

/**
 * @swagger
 *  /api/v1/master/item-supplier-mapping:
 *   get:
 *     summary: Delete Item Supplier Mapping by ID
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemSupplierMapId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Item Supplier Mapping ID.
 */

itemSupplierMapRouter.delete(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "DELETE")),
  deleteItemSupplierMapById,
);

/**
 * @swagger
 * /api/v1/master/item-supplier-mapping/excel:
 *   get:
 *     summary: Download Excel for Item Supplier Mapping
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 */

itemSupplierMapRouter.get(
  "/export",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "VIEW")),
  exportItemSupplierMapExcel,
);

/**
 * @swagger
 * /api/v1/master/item-supplier-mapping/import:
 *   post:
 *     summary: Import Item Supplier Mapping via Excel
 *     tags: [Item Supplier Mapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/itemSupplierMapImportSchema'
 *               - type: object
 *                 required: [excelFile]
 *                 properties:
 *                   excelFile:
 *                     type: string
 *                     format: binary
 *                     description: The Excel file to upload.
 */
itemSupplierMapRouter.post(
  "/import",
  verifyToken(ServiceCode.INVENTORY),
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("INV", "ITEM_SUPPLIER_MAP", "CREATE")),
  validateImportExcelItemSupplierMap,
  importItemSupplierMapExcel,
);
