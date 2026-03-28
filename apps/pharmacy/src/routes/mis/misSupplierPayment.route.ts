import {
  excelMisSupplierReport,
  misSupplierPaymentList,
} from "@/controllers/mis/misSupplierPayment.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const misSupplierPaymentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Mis SupplierPayment
 *   description: Mis SupplierPayment management endpoints
 */

/**
 * @swagger
 * /api/v1/mis-branch:
 *   post:
 *     summary: Create a new Mis SupplierPayment
 *     tags: [Mis SupplierPayment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misSupplierPaymentRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "MIS_SUPPLIER_PAYMENT", "VIEW")),
  misSupplierPaymentList,
);

misSupplierPaymentRouter.post(
  "/excel",
  verifyToken,
  authorize(getPermission("PMS", "MIS_SUPPLIER_PAYMENT", "VIEW")),
  //   validateGatePassFilter,
  excelMisSupplierReport,
);
