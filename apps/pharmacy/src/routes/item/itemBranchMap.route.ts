import {
  branchItemMapExcelImport,
  BranchToBranchCopyItemBranchMap,
  createItemBranchMap,
  deleteItemBranch,
  excelBranchItemMap,
  getItemBranch,
  getItemBranchMapDetailsForUpdate,
  updateItemBranchMap,
  updateItemWiseItemBranchMap,
} from "@/controllers/item/itemBranchMap.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateItemBranchMap,
  validateGetItemBranchMap,
  validateInputExcelItemBranchMap,
  validateItemBranchMapCopy,
  validateItemWiseItemBranchMapUpdate,
  validateUpdateItemBranchMap,
} from "@/validations/request/item/itemBranch.validation.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { Router } from "express";

export const itemBranchRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item branch map
 *   description: Item Branch endpoints
 */

/**
 * @swagger
 * /api/v1/item-branch:
 *   post:
 *     summary: Create a new Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createItemBranchMapSchema'
 */
itemBranchRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_BRANCH", "CREATE")),
  validateCreateItemBranchMap,
  createItemBranchMap
);

/**
 * @swagger
 * /api/v1/item-branch:
 *   post:
 *     summary: Create a new Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getItemBranchMapSchema'
 */
itemBranchRouter.post(
  "/get",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_BRANCH", "VIEW")),
  validateGetItemBranchMap,
  getItemBranch
);

/**
 * @swagger
 * /api/v1/item-branch:
 *   put:
 *     summary: Update a new Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateItemBranchMapSchema'
 */
itemBranchRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "ITEM_BRANCH", "VIEW"),
    getPermission("PMS", "ITEM_BRANCH", "UPDATE")
  ),
  validateUpdateItemBranchMap,
  updateItemBranchMap
);

/**
 * @swagger
 * /api/v1/item-branch/{id}:
 *   delete:
 *     summary: Delete a single Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 */
itemBranchRouter.delete(
  "/:id",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_BRANCH", "DELETE")),
  deleteItemBranch
);

/**
 * @swagger
 * /api/v1/item-branch/excel:
 *   post:
 *     summary: Download excel for Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/excelInputItemBranchMapSchema'
 */
itemBranchRouter.post(
  "/get-excel",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_BRANCH_EXCEL", "VIEW")),
  validateInputExcelItemBranchMap,
  excelBranchItemMap
);

/**
 * @swagger
 * /api/v1/item-branch/import:
 *   post:
 *     summary: Import Excel for Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               excelFile:
 *                 type: string
 *                 format: binary
 *                 description: Excel file to be uploaded
 *           encoding:
 *             excelFile:
 *               contentType:
 *                 - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *                 - application/vnd.ms-excel
 */

itemBranchRouter.post(
  "/import",
  verifyToken,
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  authorize(getPermission("PMS", "ITEM_BRANCH", "VIEW")),
  branchItemMapExcelImport
);

/**
 * @swagger
 * /api/v1/item-branch/update:
 *   put:
 *     summary: Update Item branch map item wise
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateItemWiseItemBranchMapSchema'
 */
itemBranchRouter.put(
  "/update",
  verifyToken,
  authorize(
    getPermission("PMS", "ITEM_BRANCH", "VIEW"),
    getPermission("PMS", "ITEM_BRANCH", "UPDATE")
  ),
  validateItemWiseItemBranchMapUpdate,
  updateItemWiseItemBranchMap
);

/**
 * @swagger
 * /api/v1/item-branch/copy:
 *   post:
 *     summary: Copy Item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchToBranchCopyItemBranchMapSchema'
 */

itemBranchRouter.post(
  "/copy",
  verifyToken,
  authorize(
    getPermission("PMS", "ITEM_BRANCH", "VIEW"),
    getPermission("PMS", "ITEM_BRANCH", "UPDATE")
  ),
  validateItemBranchMapCopy,
  BranchToBranchCopyItemBranchMap
);

/**
 * @swagger
 * /api/v1/item-branch/mapping:
 *   get:
 *     summary: Retrieve a list of Branch which are used in item branch map
 *     tags: [Item branch map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item id.
 */
itemBranchRouter.get(
  "/mapping",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_BRANCH", "VIEW")),
  getItemBranchMapDetailsForUpdate
);
