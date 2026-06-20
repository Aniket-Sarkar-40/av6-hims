import {
  excelMisSaleReport,
  getSellMisController,
  getSellMisExcelController,
  misSaleList,
} from "@/controllers/mis/misSale.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const misSaleRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Mis Sale
 *   description: Mis Sale management endpoints
 */

/**
 * @swagger
 * /api/v1/mis-branch:
 *   post:
 *     summary: Create a new Mis Sale
 *     tags: [Mis Sale]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misSaleRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_SALE", "VIEW")),
  misSaleList
);

/**
 * @swagger
 * /api/v1/mis-branch:
 *   post:
 *     summary: Create a new Mis Sale
 *     tags: [Mis Sale]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misSaleRouter.get(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_SALE", "VIEW")),
  excelMisSaleReport
);

/**
 * @swagger
 * /api/v1/sell:
 *   post:
 *     summary: Create a new Mis Sale
 *     tags: [Mis Sale]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misSaleRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_SALE", "VIEW")),
  getSellMisController
);

/**
 * @swagger
 * /api/v1/mis-branch:
 *   post:
 *     summary: Create a new Mis Sale
 *     tags: [Mis Sale]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
misSaleRouter.post(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIS_SALE", "VIEW")),
  getSellMisExcelController
);
