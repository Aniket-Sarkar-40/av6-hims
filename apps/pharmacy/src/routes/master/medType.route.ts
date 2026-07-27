import {
  createMedType,
  getAllMedType,
  getMedTypeById,
  updateMedType,
} from "@/controllers/master/medType.controller.js";
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

const medTypeRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Medicine Type
 *   description: Medicine Type management endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-type:
 *   post:
 *     summary: Create a new Medicine Type
 *     tags: [Medicine Type]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchema'
 */
medTypeRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_TYPE", "CREATE")),
  validateDropDownName,
  createMedType,
);

/**
 * @swagger
 * /api/v1/master/med-type:
 *   get:
 *     summary: Retrieve a list of Medicine Type
 *     tags: [Medicine Type]
 *     security:
 *       - bearerAuth: []
 */
medTypeRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_TYPE", "VIEW")),
  getAllMedType,
);

/**
 * @swagger
 * /api/v1/master/med-type/id:
 *   get:
 *     summary: Retrieve a single Medicine Type
 *     tags: [Medicine Type]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
medTypeRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_TYPE", "VIEW")),
  getMedTypeById,
);

/**
 * @swagger
 * /api/v1/master/med-type:
 *   put:
 *     summary: Update a Medicine Type's details
 *     tags: [Medicine Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medTypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MedType ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchemaUpdate'
 */
medTypeRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_TYPE", "VIEW"),
    getPermission("PMS", "MEDICINE_TYPE", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateMedType,
);

export default medTypeRouter;
