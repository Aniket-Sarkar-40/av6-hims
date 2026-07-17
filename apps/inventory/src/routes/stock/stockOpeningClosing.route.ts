import { getOpeningClosingStockById } from "@/controllers/stock/stockOpeningClosing.controller.js";
import { validateStockOpeningClosingFilter } from "@/validations/request/stock/stockOpeningClosing.validation.js";
import { authorizeExternal } from "@apps/core/middleware/auth.middleware.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

const stockOpeningClosingRouter: Router = Router();

/**
 * @swagger
 * tags:
 *  name: Stock Opening Closing
 *  description: Stock Opening Closing endpoints
 */

/**
 * @swagger
 * /api/v1/stock-opening-closing:
 *  post:
 *    summary: Get stock opening closing report
 *    tags: [Stock Opening Closing]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/stockOpeningClosingFilterSchema'
 */
stockOpeningClosingRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "STOCK_OPENING_CLOSING", "VIEW")),
  validateStockOpeningClosingFilter,
  getOpeningClosingStockById
);

stockOpeningClosingRouter.post(
  "/ext",
  authorizeExternal(),
  validateStockOpeningClosingFilter,
  getOpeningClosingStockById
);

export default stockOpeningClosingRouter;
