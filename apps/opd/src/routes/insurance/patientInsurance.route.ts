import {
  createPatientsInsurance,
  deletePatientsInsurance,
  getAllPatientsInsurance,
  getPatientsInsuranceById,
  updatePatientsInsurance,
} from "@/controllers/insurance/patientsInsurance.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadFieldsMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validatePatientsInsurance,
  validatePatientsInsuranceUpdate,
} from "@/validations/request/insurance/patientsInsurance.validation.js";
import { Router } from "express";

export const patientsInsuranceRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Patients Insurance
 *   description: patientsInsurance endpoints
 */

/**
 * @swagger
 * /api/v1/patientsInsurance:
 *   post:
 *     summary: Create a new patientsInsurance
 *     tags: [Patients Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientsInsuranceSchema'
 */
patientsInsuranceRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "PATIENT_INSURANCE", "CREATE")),
  createUploadFieldsMiddleware("patient_images/card_image", [
    "cardFrontImage",
    "cardBackImage",
  ]),
  validatePatientsInsurance,
  createPatientsInsurance,
);

/**
 * @swagger
 * /api/v1/patientsInsurance:
 *   put:
 *     summary: Update a patientsInsurance
 *     tags: [Patients Insurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientsInsuranceUpdateSchema'
 */
patientsInsuranceRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("OPD", "PATIENT_INSURANCE", "VIEW"),
    getPermission("OPD", "PATIENT_INSURANCE", "UPDATE"),
  ),
  createUploadFieldsMiddleware("patient_images/card_image", [
    "cardFrontImage",
    "cardBackImage",
  ]),
  validatePatientsInsuranceUpdate,
  updatePatientsInsurance,
);

/**
 * @swagger
 * /api/v1/patientsInsurance:
 *   get:
 *     summary: Get all patientsInsurances
 *     tags: [Patients Insurance]
 *     security:
 *       - bearerAuth: []
 */
patientsInsuranceRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "PATIENT_INSURANCE", "VIEW")),
  getAllPatientsInsurance,
);

/**
 * @swagger
 * /api/v1/patientsInsurance/id:
 *   post:
 *     summary: Retrieve a single patientsInsurance
 *     tags: [patientsInsurance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/patientsInsuranceSchema'
 */
patientsInsuranceRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("OPD", "PATIENT_INSURANCE", "VIEW")),
  getPatientsInsuranceById,
);

/**
 * @swagger
 * /api/v1/patientsInsurance/{id}:
 *   delete:
 *     summary: Delete a single patientsInsurance
 *     tags: [patientsInsurance]
 *     security:
 *       - bearerAuth: []
 */
patientsInsuranceRouter.delete(
  "/id",
  verifyToken,
  authorize(getPermission("OPD", "PATIENT_INSURANCE", "DELETE")),
  deletePatientsInsurance,
);

// /**
//  * @swagger
//  * /api/v1/patientsInsurance/search:
//  *   post:
//  *     summary: Search patientsInsurance
//  *     tags: [patientsInsurance]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/patientsInsuranceSearchSchema'
//  */
// patientsInsuranceRouter.post(
//   "/search",
//   verifyToken,
//   authorize("pms:patientsInsurance-search:add"),
//   validatepatientsInsuranceSearch,
//   patientsInsuranceSearch
// );

// /**
//  * @swagger
//  * /api/v1/patientsInsurance/stock:
//  *   post:
//  *     summary: Search patientsInsurance
//  *     tags: [patientsInsurance]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/getpatientsInsuranceStockReqSchema'
//  */
// patientsInsuranceRouter.post(
//   "/stock",
//   verifyToken,
//   authorize("pms:patientsInsurance-batch:view"),
//   validatepatientsInsuranceStock,
//   getpatientsInsuranceStocksBypatientsInsuranceId
// );
