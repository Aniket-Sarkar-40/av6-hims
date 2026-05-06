import {
  commonDelete,
  commonDropdownSearch,
  commonExcelExport,
  commonExcelImport,
  commonFetch,
  commonFSExcelExport,
  commonSearch,
  commonUpdateStatus,
  fixedSearch,
  fixedSearchWoPaginationController,
  getImage,
} from "@/controllers/common.controller.js";
import { authorizeCommonSearch } from "@/middleware/auth.middleware.js";
// import { createUploadMiddleware } from "@/middlewares/imageUpload.middleware";
import {
  validateCommonDelete,
  validateCommonExcelExport,
  validateCommonExportExcel,
  // validateCommonExportExcel,
  validateCommonFetch,
  validateCommonImportExcel,
  // validateCommonImportExcel,
  validateCommonUpdateStatus,
  validateDropdownRequest,
  validateFixedSearchFetch,
  validateFixedSearchWoPagination,
  validateSearchRequest,
} from "@/validations/request/common.validation.js";
import { verifyToken } from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { Router } from "express";

const commonRouter: Router = Router();
/**
 * @swagger
 * tags:
 *   name: Common
 *   description: Common endpoints
 */

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
  verifyToken,
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
  verifyToken,
  authorizeCommonSearch(),
  validateDropdownRequest,
  commonDropdownSearch
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
  verifyToken,
  authorizeCommonSearch(),
  validateFixedSearchFetch,
  fixedSearch
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
  verifyToken,
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
  verifyToken,
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
  verifyToken,
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
  verifyToken,
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
  verifyToken,
  authorizeCommonSearch(),
  validateCommonUpdateStatus,
  commonUpdateStatus
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
commonRouter.get("/image/:fileName", getImage);

export default commonRouter;
