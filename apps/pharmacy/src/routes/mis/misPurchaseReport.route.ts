import {
  excelMisPurchaseReport,
  misPurchaseReportList,
} from "@/controllers/mis/misPurchaseReport.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const misPurchaseReportRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Mis PurchaseReport
 *   description: Mis PurchaseReport management endpoints
 */

/**
 * @swagger
 * /api/v1/mis-branch:
 *   post:
 *     summary: Create a new Mis PurchaseReport
 *     tags: [Mis PurchaseReport]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misPurchaseReportRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_PURCHASE_REPORT", "VIEW")),
  misPurchaseReportList
);

misPurchaseReportRouter.get(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_PURCHASE_REPORT", "VIEW")),
  //   validateGatePassFilter,
  excelMisPurchaseReport
);
