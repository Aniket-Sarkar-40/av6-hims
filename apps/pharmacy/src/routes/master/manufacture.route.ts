import {
  getManufactureById,
  manufactureCreate,
  manufactureGet,
  updateManufacture,
} from "@/controllers/master/manufacture.controller.js";
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

export const manufactureRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Manufacture
 *   description: Manufacture endpoints
 */

/**
 * @swagger
 * /api/v1/master/manufacture:
 *   post:
 *     summary: Create a new Manufacture
 *     tags: [Manufacture]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dropDownNameSchema'
 *     responses:
 *       '201':
 *         description: manufacture created
 *       '400':
 *         description: Validation error
 */
manufactureRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_MANUFACTURER", "CREATE")),
  validateDropDownName,
  manufactureCreate,
);

/**
 * @swagger
 * /api/v1/master/manufacture:
 *   get:
 *     summary: Retrieve all Manufactures
 *     tags: [Manufacture]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of manufacture
 */
manufactureRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_MANUFACTURER", "VIEW")),
  manufactureGet,
);

/**
 * @swagger
 * /api/v1/master/manufacture/id:
 *   get:
 *     summary: Retrieve a single Manufacture
 *     tags: [Manufacture]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: manufacture found
 *       '404':
 *         description: manufacture not found
 */
manufactureRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_MANUFACTURER", "VIEW")),
  getManufactureById,
);

/**
 * @swagger
 * /api/v1/master/manufacture:
 *   put:
 *     summary: Update an existing Manufacture
 *     tags: [Manufacture]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dropDownNameSchemaUpdate'
 *     responses:
 *       '200':
 *         description: manufacture updated
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: manufacture not found
 */
manufactureRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_MANUFACTURER", "VIEW"),
    getPermission("PMS", "MEDICINE_MANUFACTURER", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateManufacture,
);

export default manufactureRouter;
