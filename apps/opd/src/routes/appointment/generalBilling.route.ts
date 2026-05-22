import {
  createGeneralBilling,
  deleteGeneralBilling,
  returnGeneralBilling,
  updateGeneralBilling,
} from "@/controllers/appointment/generalBilling.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateGeneralBilling,
  validateReturnGeneralBilling,
  validateUpdateGeneralBilling,
} from "@/validations/request/appointment/generalBilling.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const generalBillingRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: General Billing
 *   description: General Billing management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/general-billing:
 *   post:
 *     summary: Create a new General Billing entry
 *     tags: [General Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneralBillingCreateInput'
 */

generalBillingRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILLING", "CREATE")),
  validateCreateGeneralBilling,
  createGeneralBilling
);
/**
 * @swagger
 * /api/v1/appointment/general-billing:
 *   put:
 *     summary: Update an existing General Billing entry
 *     tags: [General Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneralBillingUpdateInput'
 */

generalBillingRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILLING", "UPDATE")),
  validateUpdateGeneralBilling,
  updateGeneralBilling
);

/**
 * @swagger
 * /api/v1/appointment/general-billing/{id}:
 *   delete:
 *     summary: Delete a single General Billing entry
 *     tags: [General Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the General Billing entry to delete
 */

generalBillingRouter.delete(
  "/delete",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILLING", "DELETE")),
  deleteGeneralBilling
);

generalBillingRouter.put(
  "/return",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "GENERAL_BILLING", "UPDATE")),
  validateReturnGeneralBilling,
  returnGeneralBilling
);
