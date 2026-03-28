import {
  excelMisStoreRequisition,
  misStoreRequisitionList,
} from "@/controllers/mis/misStoreRequisition.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const misStoreRequisitionRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Mis Store Requisition
 *   description: Mis Store Requisition management endpoints
 */

/**
 * @swagger
 * /api/v1/mis-storeRequisition:
 *   post:
 *     summary: Create a new Mis Store Requisition
 *     tags: [Mis Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misStoreRequisitionRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "MIS_STORE_REQUISITION", "VIEW")),
  misStoreRequisitionList,
);
misStoreRequisitionRouter.post(
  "/excel",
  verifyToken,
  authorize(getPermission("PMS", "MIS_STORE_REQUISITION", "VIEW")),
  excelMisStoreRequisition,
);
