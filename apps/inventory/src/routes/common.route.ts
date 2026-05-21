import {
  commonCreate,
  commonDelete,
  commonDropdownSearch,
  commonExcelExport,
  commonExcelImport,
  commonFetch,
  commonFSExcelExport,
  commonLockUnlock,
  commonSearch,
  commonUpdate,
  commonUpdateStatus,
  fixedSearch,
  fixedSearchWoPaginationController,
} from "@/controllers/common.controller.js";
import { verifyToken } from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import {
  validateCommonCreate,
  validateCommonDelete,
  validateCommonExcelExport,
  validateCommonExportExcel,
  validateCommonFetch,
  validateCommonImportExcel,
  validateCommonLock,
  validateCommonUpdate,
  validateCommonUpdateStatus,
  validateDropdownRequest,
  validateFixedSearchFetch,
  validateFixedSearchWoPagination,
  validateSearchRequest,
} from "@/validations/request/common.validation.js";
import { Router } from "express";
import { authorizeCommonSearch } from "@/middleware/auth.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const commonRouter: Router = Router();
/**
 * @swagger
 * tags:
 *   name: Common
 *   description: Common endpoints
 */

commonRouter.post(
  "/lock",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonLock,
  commonLockUnlock
);

commonRouter.post(
  "/create",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonCreate,
  commonCreate
);
commonRouter.put(
  "/update",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonUpdate,
  commonUpdate
);

/**
 * @swagger
 * /api/v1/common/fixedSearch:
 *   post:
 *     summary: filter data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/fixedSearchSchema'
 */
// POST /fixedSearch
commonRouter.post(
  "/fixedSearch",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateFixedSearchFetch,
  fixedSearch
);

/**
 * @swagger
 * /api/v1/common/search:
 *   post:
 *     summary: Search data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/searchRequestSchema'
 */
// POST /users
commonRouter.post(
  "/search",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateSearchRequest,
  commonSearch
);

/**
 * @swagger
 * /api/v1/common/dropdownSearch:
 *   post:
 *     summary: filter data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropdownSchema'
 */
// POST /fixedSearch
commonRouter.post(
  "/dropdownSearch",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateDropdownRequest,
  commonDropdownSearch
);

/**
 * @swagger
 * /api/v1/common/fixedSearchWOP:
 *   post:
 *     summary: filter data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/fixedSearchWOPSchema'
 */
// POST /fixedSearch
commonRouter.post(
  "/fixedSearchWOP",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateFixedSearchWoPagination,
  fixedSearchWoPaginationController
);

/**
 * @swagger
 * /api/v1/common/excel-export-fs:
 *   post:
 *     summary: filter data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonExcelExportSchema'
 */
// POST /fixedSearch
commonRouter.post(
  "/excel-export-fs",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonExcelExport,
  commonFSExcelExport
);

/**
 * @swagger
 * /api/v1/common/fetch:
 *   post:
 *     summary: fetch data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonFetchSchema'
 */
// POST /fetch
commonRouter.post(
  "/fetch",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonFetch,
  commonFetch
);

/**
 * @swagger
 * /api/v1/common/importExcel:
 *   post:
 *     summary: Import excel data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonImportExcelSchema'
 */
// POST /importExcel
commonRouter.post(
  "/importExcel",
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  validateCommonImportExcel,
  commonExcelImport
);

/**
 * @swagger
 * /api/v1/common/exportExcel:
 *   post:
 *     summary: Export excel data
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonExportExcelSchema'
 */
// POST /exportExcel
commonRouter.post("/exportExcel", validateCommonExportExcel, commonExcelExport);

/**
 * @swagger
 * /api/v1/common:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Common]
 */
// DELETE/:shortCode/:id
commonRouter.delete(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonDelete,
  commonDelete
);

/**
 * @swagger
 * /api/v1/common/updateStatus:
 *   patch:
 *     summary: Update the status of a resource by short code and ID
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonUpdateStatusSchema'
 */
// DELETE/:shortCode/:id
commonRouter.patch(
  "/updateStatus",
  verifyToken(ServiceCode.INVENTORY),
  authorizeCommonSearch(),
  validateCommonUpdateStatus,
  commonUpdateStatus
);

// /**
//  * @swagger
//  * /api/v1/common/updateStatus:
//  *   patch:
//  *     summary: Update the status of a resource by short code and ID
//  *     tags: [Common]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/commonUpdateStatusSchema'
//  */
// // DELETE/:shortCode/:id
// commonRouter.get("/image/:fileName", getImage);
