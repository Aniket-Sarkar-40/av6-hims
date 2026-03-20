import {
  commonDelete,
  commonDropdownSearch,
  commonExcelExport,
  commonExcelImport,
  commonFetch,
  commonSearch,
  commonUpdateStatus,
  fixedSearch,
  fixedSearchWoPaginationController,
} from "@/controllers/common.controller.js";
import { verifyToken } from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import {
  validateCommonDelete,
  validateCommonExportExcel,
  validateCommonFetch,
  validateCommonImportExcel,
  validateCommonUpdateStatus,
  validateDropdownRequest,
  validateFixedSearchFetch,
  validateFixedSearchWoPagination,
  validateSearchRequest,
} from "@/validations/request/common.validation.js";
import { Router } from "express";
import { authorizeCommonSearch } from "@/middleware/auth.middleware.js";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";

export const commonRouter: Router = Router();
/**
 * @swagger
 * tags:
 *   name: Common
 *   description: Common endpoints
 */

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
commonRouter.post(
  "/fixedSearch",
  verifyToken,
  authorizeCommonSearch(),
  validateFixedSearchFetch,
  fixedSearch,
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
commonRouter.post(
  "/search",
  verifyToken,
  authorizeCommonSearch(),
  validateSearchRequest,
  commonSearch,
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
commonRouter.post(
  "/dropdownSearch",
  verifyToken,
  authorizeCommonSearch(),
  validateDropdownRequest,
  commonDropdownSearch,
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
commonRouter.post(
  "/fixedSearchWOP",
  verifyToken,
  authorizeCommonSearch(),
  validateFixedSearchWoPagination,
  fixedSearchWoPaginationController,
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
commonRouter.post(
  "/fetch",
  verifyToken,
  authorizeCommonSearch(),
  validateCommonFetch,
  commonFetch,
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
commonRouter.post(
  "/importExcel",
  createUploadMiddleware("excelFile"),
  uploadToHetzner("excel"),
  validateCommonImportExcel,
  commonExcelImport,
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
commonRouter.post("/exportExcel", validateCommonExportExcel, commonExcelExport);

/**
 * @swagger
 * /api/v1/common:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Common]
 */
commonRouter.delete(
  "/",
  verifyToken,
  authorizeCommonSearch(),
  validateCommonDelete,
  commonDelete,
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
commonRouter.patch(
  "/updateStatus",
  verifyToken,
  authorizeCommonSearch(),
  validateCommonUpdateStatus,
  commonUpdateStatus,
);
