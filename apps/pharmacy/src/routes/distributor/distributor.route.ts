import {
  distributorCreate,
  distributorDelete,
  distributorUpdate,
  getAllDistributor,
  getDistributorById,
} from "@/controllers/distributor/distributor.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadFieldsMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateDistributor,
  validateUpdateDistributor,
} from "@/validations/request/distributor/distributor.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const distributorRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Distributor
 *   description: Distributor endpoints
 */

/**
 * @swagger
 * /api/v1/distributor:
 *   post:
 *     summary: Create a new Distributor
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createDistributorSchema'
 */
distributorRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "DISTRIBUTOR", "CREATE")),
  createUploadFieldsMiddleware("distributor", [
    "distLicNumber",
    "distLicDocument",
    "distAgreementDoc",
    "distGhanaDoc",
    "distDrugDoc",
  ]),
  validateCreateDistributor,
  distributorCreate,
);

/**
 * @swagger
 * /api/v1/distributor:
 *   put:
 *     summary: Update a Distributor
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateDistributorSchema'
 */
distributorRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "DISTRIBUTOR", "VIEW"),
    getPermission("PMS", "DISTRIBUTOR", "UPDATE"),
  ),
  createUploadFieldsMiddleware("distributor", [
    "distLicNumber",
    "distLicDocument",
    "distAgreementDoc",
    "distGhanaDoc",
    "distDrugDoc",
  ]),
  validateUpdateDistributor,
  distributorUpdate,
);

/**
 * @swagger
 * /api/v1/distributor:
 *   get:
 *     summary: get all Distributor
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 */
distributorRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "DISTRIBUTOR", "VIEW")),
  getAllDistributor,
);

/**
 * @swagger
 * /api/v1/distributor/id:
 *   get:
 *     summary: get all Distributor
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 */
distributorRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "DISTRIBUTOR", "VIEW")),
  getDistributorById,
);

/**
 * @swagger
 * /api/v1/distributor/{id}:
 *   delete:
 *     summary: Delete a single Distributor
 *     tags: [Distributor]
 *     security:
 *       - bearerAuth: []
 */
distributorRouter.delete(
  "/:id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "DISTRIBUTOR", "DELETE")),
  distributorDelete,
);
