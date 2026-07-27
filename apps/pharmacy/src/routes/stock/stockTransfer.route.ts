import {
  acknowledgeStockTransfer,
  approveReturnStockTransfer,
  approveStockTransfer,
  createStockTransfer,
  deleteStockTransfer,
  getAllStockTransfer,
  getStockTransferById,
  searchStockTransfer,
  updateStockTransfer,
} from "@/controllers/stock/stockTransfer.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

import {
  validateAcknowledgeSearchStockTransfer,
  validateAppAckStockTransfer,
  validateCreateStockTransfer,
  validateDeleteStockTransfer,
  validateSearchStockTransfer,
  validateUpdateStockTransfer,
} from "@/validations/request/stock/stockTransfer.validation.js";

import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
export const stockTransferRouter: Router = Router();

/**
 * @swagger
 * tags:
 *  name: Stock Transfer
 *  description: Stock Transfer endpoints
 */

/**
 * @swagger
 * /api/v1/stock-transfer:
 *  post:
 *    summary: Create a new stock transfer
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/stockTransferCreateSchema'
 */

stockTransferRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER", "CREATE")),
  validateCreateStockTransfer,
  createStockTransfer,
);

/**
 * @swagger
 * /api/v1/stock-transfer:
 *  put:
 *    summary: update a stock transfer
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/updateStockTransferCreateSchema'
 */

stockTransferRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "STOCK_TRANSFER", "VIEW"),
    getPermission("PMS", "STOCK_TRANSFER", "UPDATE"),
  ),
  validateUpdateStockTransfer,
  updateStockTransfer,
);

/**
 * @swagger
 * /api/v1/stock-transfer/{id}:
 *  delete:
 *    summary: update a stock transfer
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/stockTransferSchema'
 */

stockTransferRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER", "DELETE")),
  validateDeleteStockTransfer,
  deleteStockTransfer,
);

/**
 * @swagger
 * /api/v1/stock-transfer/approve:
 *  post:
 *    summary: Approve a stock transfer
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/updateStockTransferInputSchema'
 */

stockTransferRouter.post(
  "/approve",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER_APPROVE", "CREATE")),
  validateAppAckStockTransfer,
  approveStockTransfer,
);
/**
 * @swagger
 * /api/v1/stock-transfer/approve-return:
 *  post:
 *    summary: Approve a stock transfer return
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/updateStockTransferInputSchema'
 */

stockTransferRouter.post(
  "/approve-return",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "BRANCH_STOCK_TRANSFER_APPROVE_RETURN", "CREATE"),
  ),
  validateAppAckStockTransfer,
  approveReturnStockTransfer,
);

/**
 * @swagger
 * /api/v1/stock-transfer/acknowledge:
 *  post:
 *    summary: Acknowledge a new stock transfer
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/acknowlwdgeStockTransferSchema'
 */
stockTransferRouter.post(
  "/acknowledge",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER_ACK", "CREATE")),
  validateAcknowledgeSearchStockTransfer,
  acknowledgeStockTransfer,
);

/**
 * @swagger
 * /api/v1/stock-transfer/id:
 *   get:
 *     summary: Get a stock transfer
 *     tags: [Stock Transfer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock Transfer Id.
 */

stockTransferRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER", "VIEW")),
  getStockTransferById,
);

/**
 * @swagger
 * /api/v1/stock-transfer:
 *  get:
 *    summary: Get all stock transfer
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 */
stockTransferRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER", "VIEW")),
  getAllStockTransfer,
);

/**
 * @swagger
 * /api/v1/stock-transfer/search:
 *  post:
 *    summary: Search stock transfers
 *    tags: [Stock Transfer]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/searchStockTransferSchema'
 */
stockTransferRouter.post(
  "/search",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STOCK_TRANSFER_SEARCH", "VIEW")),
  validateSearchStockTransfer,
  searchStockTransfer,
);

export default stockTransferRouter;
