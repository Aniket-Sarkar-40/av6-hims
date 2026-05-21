import { Router } from "express";
import {
  compositionMedGet,
  compositionNameCreate,
  getMedCompoById,
  updateMedCompo,
} from "@/controllers/master/medComposition.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  validateDropDownName,
  validateDropDownNameUpdate,
} from "@/validations/request/master/dropDown.validation.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const medCompoRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Med Composition
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-compo:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Med Composition]
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
medCompoRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_COMPOSITION", "CREATE")),
  validateDropDownName,
  compositionNameCreate
);

/**
 * @swagger
 * /api/v1/master/med-compo:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Med Composition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
medCompoRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_COMPOSITION", "VIEW")),
  compositionMedGet
);

/**
 * @swagger
 * /api/v1/master/med-compo/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Med Composition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
medCompoRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_COMPOSITION", "VIEW")),
  getMedCompoById
);

/**
 * @swagger
 * /api/v1/master/med-compo:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Med Composition]
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
medCompoRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_COMPOSITION", "VIEW"),
    getPermission("PMS", "MEDICINE_COMPOSITION", "UPDATE")
  ),
  validateDropDownNameUpdate,
  updateMedCompo
);

export default medCompoRouter;
