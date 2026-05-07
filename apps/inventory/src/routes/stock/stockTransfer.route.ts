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
  validateAcknowledgeStockTransfer,
  validateApproveReturnStockTransfer,
  validateApproveStockTransfer,
  validateCreateStockTransfer,
  validateDeleteStockTransfer,
  validateSearchStockTransfer,
  validateUpdateStockTransfer,
} from "@/validations/request/stock/stockTransfer.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";
const stockTransferRouter: Router = Router();

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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER", "CREATE")),
  validateCreateStockTransfer,
  createStockTransfer
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
  verifyToken,
  authorize(
    getPermission("INV", "STOCK_TRANSFER", "VIEW"),
    getPermission("INV", "STOCK_TRANSFER", "UPDATE")
  ),
  validateUpdateStockTransfer,
  updateStockTransfer
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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER", "DELETE")),
  validateDeleteStockTransfer,
  deleteStockTransfer
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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER_APPROVE", "CREATE")),
  validateApproveStockTransfer,
  approveStockTransfer
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
  verifyToken,
  authorize(
    getPermission("INV", "BRANCH_STOCK_TRANSFER_APPROVE_RETURN", "CREATE")
  ),
  validateApproveReturnStockTransfer,
  approveReturnStockTransfer
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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER_ACKNOWLEDGE", "CREATE")),
  validateAcknowledgeStockTransfer,
  acknowledgeStockTransfer
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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER", "VIEW")),
  getStockTransferById
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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER", "VIEW")),
  getAllStockTransfer
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
  verifyToken,
  authorize(getPermission("INV", "STOCK_TRANSFER_SEARCH", "VIEW")),
  validateSearchStockTransfer,
  searchStockTransfer
);

export default stockTransferRouter;
