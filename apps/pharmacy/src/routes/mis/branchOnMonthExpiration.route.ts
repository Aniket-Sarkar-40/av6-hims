import {
  getBranchesOnMonthExpirationAmt,
  getBranchOnMonthExpiration,
  getBranchOnMonthExpirationExcel,
  getHighestAmountSellDrugByBranch,
  getHighestAmtSellingDrugByBranchExcel,
  getHighestSellingDrugByBranch,
  getHighestSellingDrugByBranchExcel,
} from "@/controllers/mis/branchOnMonthExpiration.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const branchOnMonthExpirationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Branch on month expiration
 *   description: Branch on month expiration management endpoints
 */

/**
 * @swagger
 * /api/v1/branchOnMonthExpiration:
 *   post:
 *     summary: Create a new Appointments Medicine List
 *     tags: [Branch on month expiration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchOnMonthExpirationSchema'
 */
branchOnMonthExpirationRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "BRANCH_MONTH_EXPIRATION", "VIEW")),
  getBranchOnMonthExpiration
);
branchOnMonthExpirationRouter.post(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "BRANCH_MONTH_EXPIRATION", "VIEW")),
  getBranchOnMonthExpirationExcel
);

branchOnMonthExpirationRouter.get(
  "/expiration-amount",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "BRANCH_MONTH_EXPIRATION", "VIEW")),
  getBranchesOnMonthExpirationAmt
);

branchOnMonthExpirationRouter.post(
  "/highest-selling-drug",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "HIGHEST_SELLING_DRUG", "VIEW")),
  getHighestSellingDrugByBranch
);

branchOnMonthExpirationRouter.post(
  "/highest-amt-selling-drug",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "HIGHEST_AMOUNT_SELLING_DRUG", "VIEW")),
  getHighestAmountSellDrugByBranch
);

branchOnMonthExpirationRouter.post(
  "/highest-selling-drug-excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "HIGHEST_SELLING_DRUG", "VIEW")),
  getHighestSellingDrugByBranchExcel
);

branchOnMonthExpirationRouter.post(
  "/highest-amt-selling-drug-excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "HIGHEST_AMOUNT_SELLING_DRUG", "VIEW")),
  getHighestAmtSellingDrugByBranchExcel
);
