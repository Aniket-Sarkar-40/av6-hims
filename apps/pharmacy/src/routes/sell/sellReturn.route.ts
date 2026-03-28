import {
  approveSellReturn,
  createSellReturn,
  deleteSellReturn,
  excelSellReturnReport,
  getAllSellReturn,
  getSellReturnById,
  getSellReturnPdfById,
  rejectedSellReturn,
  updateSellReturn,
} from "@/controllers/sell/sellReturn.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateSellReturnExcelFilter,
  validateSellReturnInput,
  validateSellReturnUpdate,
} from "@/validations/request/sell/sellReturn.validation.js";

import { Router } from "express";
export const sellReturnRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Sell Return
 *   description: sellReturn endpoints
 */
/**
 * @swagger
 * /api/v1/sell-return:
 *   post:
 *     summary: Create a new sellReturn
 *     tags: [Sell Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellReturnInputSchema'
 */

sellReturnRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN", "CREATE")),
  validateSellReturnInput,
  createSellReturn,
);

/**
 * @swagger
 * /api/v1/grnReturn:
 *   put:
 *     summary: Update a Sell Return's details
 *     tags: [Sell Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellReturnId
 *         required: true
 *         schema:
 *           type: string
 *         description: The sellReturn ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellReturnSchemaUpdate'
 */
sellReturnRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "SELL_RETURN", "VIEW"),
    getPermission("PMS", "SELL_RETURN", "UPDATE"),
  ),
  validateSellReturnUpdate,
  updateSellReturn,
);

/**
 * @swagger
 * /api/v1/sell-return/{id}:
 *   get:
 *    summary: Get a sell return by ID
 *    tags: [Sell Return]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *
 *
 */
sellReturnRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN", "VIEW")),
  getSellReturnById,
);

/**
 * @swagger
 * /api/v1/sell-return:
 *   get:
 *     summary: Get all sells returns
 *     tags: [Sell Return]
 *     security:
 *       - bearerAuth: []
 */

sellReturnRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN", "VIEW")),
  getAllSellReturn,
);

/**
 * @swagger
 * /api/v1/sell-return:
 *   delete:
 *     summary: Delete a sell Return by ID
 *     tags: [Sell Return]
 */
sellReturnRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN", "DELETE")),
  deleteSellReturn,
);

/**
 * @swagger
 * /api/v1/sell-return/approve:
 *   post:
 *     summary: Create a new sellReturn
 *     tags: [Sell Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellReturnInputSchema'
 */

sellReturnRouter.post(
  "/approve",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN_APPROVE", "CREATE")),
  validateSellReturnUpdate,
  approveSellReturn,
);
/**
 * @swagger
 * /api/v1/sell-return/rejected:
 *   post:
 *     summary: Create a new sellReturn
 *     tags: [Sell Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/sellReturnInputSchema'
 */

sellReturnRouter.post(
  "/rejected",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN_REJECTED", "CREATE")),
  rejectedSellReturn,
);

/**
 * @swagger
 *  /api/v1/sell-return/excel-report:
 *    post:
 *      summary: Excel creation for Sell Return
 *      tags: [Sell Return]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/sellReturnExcelFilterSchema'
 */
sellReturnRouter.post(
  "/excel-report",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN_EXCEL", "VIEW")),
  validateSellReturnExcelFilter,
  excelSellReturnReport,
);
/**
 * @swagger
 * /api/v1/sell-return/pdf:
 *   post:
 *     summary: Get sell return  receipt by sell return ID
 *     tags: [Sell Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sellReturnId
 *         required: true
 *         schema:
 *           type: string
 *         description: The sell return ID.
 */
sellReturnRouter.post(
  "/pdf",
  verifyToken,
  authorize(getPermission("PMS", "SELL_RETURN_PDF", "VIEW")),
  getSellReturnPdfById,
);
export default sellReturnRouter;
