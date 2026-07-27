import {
  createPayment,
  getPayment,
  getPaymentDetailsWithModule,
} from "@/controllers/payment/payment.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreatePayment,
  validateGetPayment,
  validateGetPaymentDetailsWithModule,
} from "@/validations/request/payment/payment.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const paymentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management endpoints
 */

/**
 * @swagger
 * /api/v1/payment/fetch:
 *   post:
 *     summary: Get payment details
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/getPaymentSchema'

 */
paymentRouter.post(
  "/fetch",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PAYMENT", "VIEW")),
  validateGetPayment,
  getPayment,
);

/**
 * @swagger
 * /api/v1/payment:
 *   post:
 *     summary: Create payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createPaymentSchema'
 */
paymentRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PAYMENT", "CREATE")),
  validateCreatePayment,
  createPayment,
);

/**
 * @swagger
 * /api/v1/payment/fetch-module-wise:
 *   post:
 *     summary: Get payment details module wise
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/getPaymentDetailsModuleWiseSchema'
 */
paymentRouter.post(
  "/fetch-module-wise",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PAYMENT", "VIEW")),
  validateGetPaymentDetailsWithModule,
  getPaymentDetailsWithModule,
);
