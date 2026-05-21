import {
  adjustSellStock,
  createSell,
  deleteSell,
  excelSellReport,
  getAllSell,
  getPaymentTransactions,
  getSellById,
  getSellPdfById,
  printNotCompletedMedReceiptByAptId,
  printReceiptBySellId,
  setSellCoPay,
  takeSellPayment,
  updateSellStatus,
} from "@/controllers/sell/sell.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateExcelFilterSell,
  validateSellInput,
  validateSellPaymentInput,
  validateSellStockAdjustmentInput,
  validateSellUpdate,
  validateSetSellCoPayInput,
} from "@/validations/request/sell/sell.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
export const sellRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Sell
 *   description: Sell endpoints
 */
/**
 * @swagger
 * /api/v1/sell:
 *   post:
 *     summary: Create a new sell
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellInputSchema'
 */

sellRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL", "CREATE")),
  validateSellInput,
  createSell
);

/**
 * @swagger
 * /api/v1/sell/{id}:
 *   get:
 *    summary: Get a sell by ID
 *    tags: [Sell]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *
 *
 *
 */
sellRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL", "VIEW")),
  getSellById
);

/**
 * @swagger
 * /api/v1/sell:
 *   get:
 *     summary: Get all sells
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 */

sellRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL", "VIEW")),
  getAllSell
);

/**
 * @swagger
 * /api/v1/sell:
 *   put:
 *     summary: Update sell status
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 */
sellRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "SELL", "VIEW"),
    getPermission("PMS", "SELL", "UPDATE")
  ),
  validateSellUpdate,
  updateSellStatus
);

/**
 * @swagger
 * /api/v1/sell:
 *   delete:
 *     summary: Delete a sell  by ID
 *     tags: [Sell ]
 */
sellRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL", "DELETE")),
  deleteSell
);

/**
 * @swagger
 * /api/v1/sell/excel-report:
 *   post:
 *     summary: Excel creation for Sell
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellExcelFilterSchema'
 */
sellRouter.post(
  "/excel-report",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL_EXCEL", "VIEW")),
  validateExcelFilterSell,
  excelSellReport
);
/**
 * @swagger
 * /api/v1/sell/pdf:
 *   post:
 *     summary: Get sell receipt by sell ID
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sellId
 *         required: true
 *         schema:
 *           type: string
 *         description: The sell ID.
 */

sellRouter.post(
  "/pdf",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL_PDF", "VIEW")),
  getSellPdfById
);

/**
 * @swagger
 * /api/v1/sell/pdf:
 *   post:
 *     summary: Get sell receipt by sell ID
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sellId
 *         required: true
 *         schema:
 *           type: string
 *         description: The sell ID.
 */

sellRouter.get("/pdf", getSellPdfById);

/**
 * @swagger
 * /api/v1/sell/sell-receipt:
 *   get:
 *     summary: Get sell receipt by sell ID
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sellId
 *         required: true
 *         schema:
 *           type: string
 *         description: The sell ID.
 */
sellRouter.get("/sell-receipt", printReceiptBySellId);

/**
 * @swagger
 * /api/v1/sell/stock-adjust:
 *   post:
 *     summary: Adjust stock for sell ans sell return
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellStockAdjustmentSchema'
 */
sellRouter.post(
  "/stock-adjust",
  // authorizeCommonApproval(),
  validateSellStockAdjustmentInput,
  adjustSellStock
);

/**
 * @swagger
 * /api/v1/sell/take-payment:
 *   post:
 *     summary: Take payment for a sell
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellPaymentSchema'
 */
sellRouter.post(
  "/take-payment",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL_PAYMENT", "CREATE")),
  validateSellPaymentInput,
  takeSellPayment
);
/**
 * @swagger
 * /api/v1/sell/set-coPay:
 *   post:
 *     summary: Set co-pay for a sell
 *     tags: [Sell]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellCoPaySchema'
 */
sellRouter.post(
  "/set-coPay",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL_COPAY", "UPDATE")),
  validateSetSellCoPayInput,
  setSellCoPay
);
export default sellRouter;

/**
 * @swagger
 * /api/v1/sell/payment-transactions:
 *   get:
 *     summary: Get all sells
 *     tags: [Sell]
 *     security:
 *       - bearerAuth: []
 */

sellRouter.get(
  "/payment-transactions",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "SELL_PAYMENT", "VIEW")),
  getPaymentTransactions
);

sellRouter.get("/sell-receipt/medicine", printNotCompletedMedReceiptByAptId);
