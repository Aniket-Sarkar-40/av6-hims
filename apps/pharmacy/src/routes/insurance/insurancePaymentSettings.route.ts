import { getAllInsurancePaymentSettings } from "@/controllers/insurance/insurancePaymentSettings.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

import { Router } from "express";

export const insurancePaymentSettingsRouter: Router = Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Patients Insurance
//  *   description: insurancePaymentSettings endpoints
//  */

// /**
//  * @swagger
//  * /api/v1/insurancePaymentSettings:
//  *   post:
//  *     summary: Create a new insurancePaymentSettings
//  *     tags: [Patients Insurance]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/insurancePaymentSettingsSchema'
//  */
// insurancePaymentSettingsRouter.post(
//   "/",
//   verifyToken,
//   authorize("pms:insurancePaymentSettings:add"),
//   createUploadFieldsMiddleware("insurancePaymentSettings", [
//     "cardFrontImage",
//     "cardBackImage",
//   ]),
//   validateInsurancePaymentSettings,
//   createInsurancePaymentSettings
// );

/**
 * @swagger
 * /api/v1/insurancePaymentSettings:
 *   put:
 *     summary: Update a insurancePaymentSettings
 *     tags: [Patients Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/insurancePaymentSettingsUpdateSchema'
 */
// insurancePaymentSettingsRouter.put(
//   "/",
//   verifyToken,
//   authorize("pms:insurancePaymentSettings:add", "pms:insurancePaymentSettings:edit"),
//   createUploadFieldsMiddleware("insurancePaymentSettings", [
//     "cardFrontImage",
//     "cardBackImage",
//   ]),
//   validateInsurancePaymentSettingsUpdate,
//   updateInsurancePaymentSettings
// );

/**
 * @swagger
 * /api/v1/insurancePaymentSettings:
 *   get:
 *     summary: Get all insurancePaymentSettings
 *     tags: [Patients Insurance]
 *     security:
 *       - bearerAuth: []
 */
insurancePaymentSettingsRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "INSURANCE_PAYMENT_SETINGS", "VIEW")),
  getAllInsurancePaymentSettings
);

/**
 * @swagger
 * /api/v1/insurancePaymentSettings/id:
 *   post:
 *     summary: Retrieve a single insurancePaymentSettings
 *     tags: [insurancePaymentSettings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/insurancePaymentSettingsSchema'
 */
// insurancePaymentSettingsRouter.get(
//   "/id",
//   verifyToken,
//   authorize("pms:insurancePaymentSettings:view"),
//   getInsurancePaymentSettingsById
// );

/**
 * @swagger
 * /api/v1/insurancePaymentSettings/{id}:
 *   delete:
 *     summary: Delete a single insurancePaymentSettings
 *     tags: [insurancePaymentSettings]
 *     security:
 *       - bearerAuth: []
 */
// insurancePaymentSettingsRouter.delete(
//   "/id",
//   verifyToken,
//   authorize("pms:insurancePaymentSettings:delete"),
//   deleteInsurancePaymentSettings
// );

// /**
//  * @swagger
//  * /api/v1/insurancePaymentSettings/search:
//  *   post:
//  *     summary: Search insurancePaymentSettings
//  *     tags: [insurancePaymentSettings]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/insurancePaymentSettingsSearchSchema'
//  */
// insurancePaymentSettingsRouter.post(
//   "/search",
//   verifyToken,
//   authorize("pms:insurancePaymentSettings-search:add"),
//   validateInsurancePaymentSettingsSearch,
//   insurancePaymentSettingsSearch
// );

// /**
//  * @swagger
//  * /api/v1/insurancePaymentSettings/stock:
//  *   post:
//  *     summary: Search insurancePaymentSettings
//  *     tags: [insurancePaymentSettings]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/getInsurancePaymentSettingsStockReqSchema'
//  */
// insurancePaymentSettingsRouter.post(
//   "/stock",
//   verifyToken,
//   authorize("pms:insurancePaymentSettings-batch:view"),
//   validateInsurancePaymentSettingsStock,
//   getInsurancePaymentSettingsStocksByInsurancePaymentSettingsId
// );
