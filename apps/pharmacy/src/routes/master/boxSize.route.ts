import {
  boxSizeCreate,
  boxSizeGet,
  getBoxSizeById,
  updateBoxSize,
} from "@/controllers/master/boxSize.controller.js";
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

export const boxSizeRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Box Size
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-drug:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Box Size]
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
boxSizeRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "BOX_SIZE", "CREATE")),
  validateDropDownName,
  boxSizeCreate,
);

/**
 * @swagger
 * /api/v1/master/med-drug:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Box Size]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
boxSizeRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "BOX_SIZE", "VIEW")),
  boxSizeGet,
);

/**
 * @swagger
 * /api/v1/master/med-drug/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Box Size]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
boxSizeRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "BOX_SIZE", "VIEW")),
  getBoxSizeById,
);

/**
 * @swagger
 * /api/v1/master/med-drug:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Box Size]
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
boxSizeRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "BOX_SIZE", "VIEW"),
    getPermission("PMS", "BOX_SIZE", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateBoxSize,
);
