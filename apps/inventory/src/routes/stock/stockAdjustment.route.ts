import {
  createStockAdjustment,
  getStockAdjustmentById,
  updateStockAdjustment,
} from "@/controllers/stock/stockAdjustment.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import {
  validateStockAdjustment,
  validateUpdateStockAdjustment,
} from "@/validations/request/stock/stockAdjustment.validation";
import { Router } from "express";

const stockAdjustmentRouter = Router();

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
  verifyToken,
  authorize(getPermission("STOCK_ADJUSTMENT", "CREATE")),
  validateStockAdjustment,
  createStockAdjustment
);

stockAdjustmentRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("STOCK_ADJUSTMENT", "UPDATE"), getPermission("STOCK_ADJUSTMENT", "VIEW")),
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
  verifyToken,
  authorize(getPermission("STOCK_ADJUSTMENT", "VIEW")),
  getStockAdjustmentById
);

export default stockAdjustmentRouter;
