import {
  createInsurance,
  deleteInsurance,
  getAllInsurance,
  getInsuranceById,
  updateInsurance,
} from "@/controllers/insurance/insurance.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadFieldsMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateInsurance,
  validateInsuranceUpdate,
} from "@/validations/request/insurance/insurance.validation.js";
import { Router } from "express";

export const insuranceRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Insurance
 *   description: insurance endpoints
 */

/**
 * @swagger
 * /api/v1/insurance:
 *   post:
 *     summary: Create a new insurance
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/insuranceSchema'
 */
insuranceRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "INSURANCE", "CREATE")),
  createUploadFieldsMiddleware("insurance", ["logoImage", "attachments"]),
  validateInsurance,
  createInsurance,
);

/**
 * @swagger
 * /api/v1/insurance:
 *   put:
 *     summary: Update a insurance
 *     tags: [insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/insuranceSchemaUpdate'
 */
insuranceRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "INSURANCE", "VIEW"),
    getPermission("PMS", "INSURANCE", "UPDATE"),
  ),
  createUploadFieldsMiddleware("insurance", ["logoImage", "attachments"]),
  validateInsuranceUpdate,
  updateInsurance,
);

/**
 * @swagger
 * /api/v1/insurance:
 *   get:
 *     summary: Get all insurances
 *     tags: [Insurance]
 *     security:
 *       - bearerAuth: []
 */
insuranceRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "INSURANCE", "VIEW")),
  getAllInsurance,
);

/**
 * @swagger
 * /api/v1/insurance/id:
 *   post:
 *     summary: Retrieve a single insurance
 *     tags: [insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/insuranceSchema'
 */
insuranceRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "INSURANCE", "VIEW")),
  getInsuranceById,
);

/**
 * @swagger
 * /api/v1/insurance/{id}:
 *   delete:
 *     summary: Delete a single insurance
 *     tags: [insurance]
 *     security:
 *       - bearerAuth: []
 */
insuranceRouter.delete(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "INSURANCE", "DELETE")),
  deleteInsurance,
);

// /**
//  * @swagger
//  * /api/v1/insurance/search:
//  *   post:
//  *     summary: Search insurance
//  *     tags: [Insurance]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/insuranceSearchSchema'
//  */
// insuranceRouter.post(
//   "/search",
//   verifyToken,
//   authorize("pms:insurance-search:add"),
//   validateinsuranceSearch,
//   insuranceSearch
// );

// /**
//  * @swagger
//  * /api/v1/insurance/stock:
//  *   post:
//  *     summary: Search insurance
//  *     tags: [insurance]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/getinsuranceStockReqSchema'
//  */
// insuranceRouter.post(
//   "/stock",
//   verifyToken,
//   authorize("pms:insurance-batch:view"),
//   validateinsuranceStock,
//   getinsuranceStocksByinsuranceId
// );
