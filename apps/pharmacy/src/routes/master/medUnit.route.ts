import {
  getMedUnitById,
  medUnitGet,
  unitCreate,
  updateMedUnit,
} from "@/controllers/master/medunit.controller.js";
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

export const medUnitRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Med Unit
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-unit:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Med Unit]
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
medUnitRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_UNIT", "CREATE")),
  validateDropDownName,
  unitCreate,
);

/**
 * @swagger
 * /api/v1/master/med-unit:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Med Unit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
medUnitRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_UNIT", "VIEW")),
  medUnitGet,
);

/**
 * @swagger
 * /api/v1/master/med-unit/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Med Unit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
medUnitRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_UNIT", "VIEW")),
  getMedUnitById,
);

/**
 * @swagger
 * /api/v1/master/med-unit:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Med Unit]
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
medUnitRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_UNIT", "VIEW"),
    getPermission("PMS", "MEDICINE_UNIT", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateMedUnit,
);

export default medUnitRouter;
