import {
  copyGeneralBillPricing,
  createGeneralBillPricing,
  generalBillPricingMapExcelExport,
  generalBillPricingMapExcelImport,
  getGeneralBillPricingWithItemByCcId,
  updateGeneralBillPricing,
} from "@/controllers/master/generalBillPricing.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateGeneralBillPricingSchema,
  validateUpdateGeneralBillPricingSchema,
  validateUpdateGeneralBillPricingSearchSchema,
} from "@/validations/request/master/generalBillPricing.validation.js";

import { Router } from "express";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const generalBillPricingRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: General Bill Pricing
 *   description: generalBillPricing management endpoints
 */

/**
 * @swagger
 * /api/v1/master/general-bill-pricing:
 *   post:
 *     summary: Create a new generalBillPricing
 *     tags: [General Bill Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createGeneralBillPricingSchema'
 */
generalBillPricingRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILL_PRICING", "CREATE")),
  validateCreateGeneralBillPricingSchema,
  createGeneralBillPricing,
);

/**
 * @swagger
 * /api/v1/master/general-bill-pricing:
 *   put:
 *     summary: Update a generalBillPricing
 *     tags: [General Bill Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateGeneralBillPricingSchema'
 */
generalBillPricingRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "GENERAL_BILL_PRICING", "VIEW"),
    getPermission("OPD", "GENERAL_BILL_PRICING", "UPDATE"),
  ),
  validateUpdateGeneralBillPricingSchema,
  updateGeneralBillPricing,
);

/**
 * @swagger
 * /api/v1/master/general-bill-pricing/get-excel:
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
generalBillPricingRouter.post(
  "/get-excel",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILL_PRICING", "VIEW")),
  generalBillPricingMapExcelExport,
);

/**
 * @swagger
 * /api/v1/master/general-bill-pricing/import-excel:
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
generalBillPricingRouter.post(
  "/import-excel",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "GENERAL_BILL_PRICING", "VIEW"),
    getPermission("OPD", "GENERAL_BILL_PRICING", "UPDATE"),
  ),
  createUploadMiddleware("filePath"),
  uploadToHetzner("generalBillPricing"),
  generalBillPricingMapExcelImport,
);

/**
 * @swagger
 * /api/v1/master/general-bill-pricing/import-excel:
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
generalBillPricingRouter.post(
  "/copy-pricing",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILL_PRICING", "VIEW")),
  copyGeneralBillPricing,
);

generalBillPricingRouter.post(
  "/item-search",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILL_PRICING", "VIEW")),
  validateUpdateGeneralBillPricingSearchSchema,
  getGeneralBillPricingWithItemByCcId,
);
