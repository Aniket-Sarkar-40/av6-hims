import {
  createStockAdjustment,
  getStockAdjustmentById,
  updateBatchExpiry,
  updateStockAdjustment,
} from "@/controllers/stock/stockAdjustment.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateStockAdjustment,
  validateUpdateBatchExpiry,
  validateUpdateStockAdjustment,
} from "@/validations/request/stock/stockAdjustment.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const stockAdjustmentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *  name: Stock Adjustment
 *  description: Stock Adjustment endpoints
 */

/**
 * @swagger
 * /api/v1/stock-adjustment:
 *  post:
 *    summary: Create a new stock adjustment
 *    tags: [Stock Adjustment]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/stockAdjustmentSchema'
 */
stockAdjustmentRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_ADJUSTMENT", "CREATE")),
  validateStockAdjustment,
  createStockAdjustment
);

stockAdjustmentRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "STOCK_ADJUSTMENT", "UPDATE"),
    getPermission("PMS", "STOCK_ADJUSTMENT", "VIEW")
  ),
  validateUpdateStockAdjustment,
  updateStockAdjustment
);
/**
 * @swagger
 * /api/v1/stock-adjustment/id:
 *  get:
 *    summary: Get stock adjustment by ID
 *    tags: [Stock Adjustment]
 *    security:
 *     - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: stockAdjustementId
 *        schema:
 *          type: string
 *        required: true
 *        description: The stock adjustment ID
 */
stockAdjustmentRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_ADJUSTMENT", "VIEW")),
  getStockAdjustmentById
);

/**
 * @swagger
 * /api/v1/stock-adjustment/batch-expiry:
 *  put:
 *    summary: Update batch expiry
 *    tags: [Stock Adjustment]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/updateBatchExpirySchema'
 */
stockAdjustmentRouter.put(
  "/batch-expiry",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_BATCH_WISE", "UPDATE")),
  validateUpdateBatchExpiry,
  updateBatchExpiry
);

export default stockAdjustmentRouter;
