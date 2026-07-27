import {
  excelMisBranch,
  misBranchList,
} from "@/controllers/mis/misBranch.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const misBranchRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Mis Branch
 *   description: Mis Branch management endpoints
 */

/**
 * @swagger
 * /api/v1/mis-branch:
 *   post:
 *     summary: Create a new Mis Branch
 *     tags: [Mis Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misBranchRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_BRANCH", "VIEW")),
  misBranchList,
);

misBranchRouter.post(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_BRANCH", "VIEW")),
  excelMisBranch,
);
