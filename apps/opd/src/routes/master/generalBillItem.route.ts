import {
  createGeneralBillItem,
  updateGeneralBillItem,
} from "@/controllers/master/generalBillItem.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateGeneralBillItemSchema,
  validateUpdateGeneralBillItemSchema,
} from "@/validations/request/master/generalBillItem.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const generalBillItemRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: General Bill Item
 *   description: generalBillItem management endpoints
 */

/**
 * @swagger
 * /api/v1/master/generalBillItem:
 *   post:
 *     summary: Create a new generalBillItem
 *     tags: [General Bill Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createGeneralBillItemSchema'
 */
generalBillItemRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILL_ITEM", "CREATE")),
  validateCreateGeneralBillItemSchema,
  createGeneralBillItem
);

/**
 * @swagger
 * /api/v1/master/generalBillItem:
 *   put:
 *     summary: Update a generalBillItem
 *     tags: [General Bill Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateGeneralBillItemSchema'
 */
generalBillItemRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "GENERAL_BILL_ITEM", "VIEW"),
    getPermission("OPD", "GENERAL_BILL_ITEM", "UPDATE")
  ),
  validateUpdateGeneralBillItemSchema,
  updateGeneralBillItem
);
