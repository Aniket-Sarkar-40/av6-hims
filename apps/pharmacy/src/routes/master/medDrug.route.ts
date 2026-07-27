import {
  getMedDrugById,
  medDrugCreate,
  medDrugGet,
  updateMedDrug,
} from "@/controllers/master/medDrug.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateDropDownName,
  validateDropDownNameUpdate,
} from "@/validations/request/master/dropDown.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const medDrugRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Med Drug
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-drug:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Med Drug]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchema'
 *     responses:
 *       '201':
 *         description: Composition created
 *       '400':
 *         description: Validation error
 */
medDrugRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_DRUG", "CREATE")),
  validateDropDownName,
  medDrugCreate,
);

/**
 * @swagger
 * /api/v1/master/med-drug:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Med Drug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
medDrugRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_DRUG", "VIEW")),
  medDrugGet,
);

/**
 * @swagger
 * /api/v1/master/med-drug/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Med Drug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
medDrugRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_DRUG", "VIEW")),
  getMedDrugById,
);

/**
 * @swagger
 * /api/v1/master/med-drug:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Med Drug]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchemaUpdate'
 *     responses:
 *       '200':
 *         description: Composition updated
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Composition not found
 */
medDrugRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_DRUG", "VIEW"),
    getPermission("PMS", "MEDICINE_DRUG", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateMedDrug,
);

export default medDrugRouter;
