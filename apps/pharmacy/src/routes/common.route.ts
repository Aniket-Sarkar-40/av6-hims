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
} from "@/controllers/common.controller.js";
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
  validateStartFlowRequest,
} from "@/validations/request/common.validation.js";
import { authorizeCommonSearch } from "@apps/core/middleware/auth.middleware.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
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
  verifyToken(ServiceCode.PHARMACY),
  authorizeCommonSearch(),
  validateCommonUpdateStatus,
  commonUpdateStatus
);

// /**
//  * @swagger
//  * /api/v1/common/approval:
//  *   patch:
//  *     summary: Approve or reject a resource
//  *     tags: [Common]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/commonUpdateStatusSchema'
//  */
// commonRouter.patch("/approval", verifyToken, validateApprovalRequest, commonApproval);
// commonRouter.patch("/approval-ext", authorizeCommonApproval(), validateApprovalRequest, commonApproval);

// /**
//  * @swagger
//  * /api/v1/common/approval:
//  *   patch:
//  *     summary: Approve or reject a resource
//  *     tags: [Common]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/commonUpdateStatusSchema'
//  */
// commonRouter.post("/approval", verifyToken, validateGetMyApprovalSchema, getStaffPendingApproval);
// commonRouter.post("/approval-ext", authorizeCommonApproval(), validateGetMyApprovalSchema, getStaffPendingApproval);

// /**
//  * @swagger
//  * /api/v1/common/getApprovalActions:
//  */
// commonRouter.post("/getApprovalActions", verifyToken, getApprovalActDetails);
// commonRouter.post("/getApprovalActions-ext", authorizeCommonApproval(), getApprovalActDetails);

// commonRouter.post("/start-flow-ext", authorizeCommonApproval(), validateStartFlowRequest, startApprovalFlow);

// // DELETE/:shortCode/:id
// commonRouter.get("/image/:fileName", getImage);

export default commonRouter;
