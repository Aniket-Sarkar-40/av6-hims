import {
  commonCreate,
  commonDelete,
  commonDropdownSearch,
  commonExcelExport,
  commonExcelImport,
  commonFetch,
  commonFSExcelExport,
  commonMultiCreateUpdate,
  commonSearch,
  commonUpdate,
  commonUpdateStatus,
  fixedSearch,
  fixedSearchWoPaginationController,
  getConfigByShortCode,
  updateConfigByCode,
} from "@/controllers/common.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import {
  validateCommonDelete,
  validateCommonExcelExport,
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
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateUpdateConfigByCode } from "@/validations/request/commonCreateUpdate.validation.js";

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
  verifyToken(ServiceCode.BLOOD_BANK),
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
  verifyToken(ServiceCode.BLOOD_BANK),
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
  verifyToken(ServiceCode.BLOOD_BANK),
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
  verifyToken(ServiceCode.BLOOD_BANK),
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
  verifyToken(ServiceCode.BLOOD_BANK),
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
  verifyToken(ServiceCode.BLOOD_BANK),
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
  verifyToken(ServiceCode.BLOOD_BANK),
  authorizeCommonSearch(),
  validateCommonUpdateStatus,
  commonUpdateStatus,
);

commonRouter.post(
  "/create",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorizeCommonSearch(),
  commonCreate,
);

commonRouter.post(
  "/multi-create-update",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorizeCommonSearch(),
  commonMultiCreateUpdate,
);

commonRouter.put(
  "/update",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorizeCommonSearch(),
  commonUpdate,
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
  verifyToken(ServiceCode.BLOOD_BANK),
  authorizeCommonSearch(),
  validateCommonExcelExport,
  commonFSExcelExport,
);

commonRouter.patch(
  "/update-shortcode-config",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "DYNAMIC_SHORT_CODE", "UPDATE")),
  validateUpdateConfigByCode,
  updateConfigByCode,
);

commonRouter.get(
  "/shortcode-config",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "DYNAMIC_SHORT_CODE", "VIEW")),
  getConfigByShortCode,
);
