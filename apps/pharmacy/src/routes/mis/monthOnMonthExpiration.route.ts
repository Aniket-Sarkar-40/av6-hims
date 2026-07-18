import {
  excelMonthOnMonthExpirationReport,
  getMisMonthOnMonthExpirationController,
} from "@/controllers/mis/monthOnMonthExpiration.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

const monthOnMonthExpirationRouter: Router = Router();

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

monthOnMonthExpirationRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_MONTH_ON_MONTH", "VIEW")),
  getMisMonthOnMonthExpirationController,
);

monthOnMonthExpirationRouter.get(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_MONTH_ON_MONTH", "VIEW")),
  //   validateGatePassFilter,
  excelMonthOnMonthExpirationReport,
);

export default monthOnMonthExpirationRouter;
