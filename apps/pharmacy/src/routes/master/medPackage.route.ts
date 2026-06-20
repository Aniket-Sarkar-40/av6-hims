import {
  getMedPackageById,
  medPackageCreate,
  medPackageGet,
  updateMedPackage,
} from "@/controllers/master/medPackage.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateMedPackage,
  validateMedPackageUpdate,
} from "@/validations/request/master/dropDown.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const medPackageRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Med Package
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-package:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Med Package]
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
medPackageRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_PACKAGE", "CREATE")),
  validateMedPackage,
  medPackageCreate
);

/**
 * @swagger
 * /api/v1/master/med-package:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Med Package]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
medPackageRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_PACKAGE", "VIEW")),
  medPackageGet
);

/**
 * @swagger
 * /api/v1/master/med-package/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Med Package]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
medPackageRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_PACKAGE", "VIEW")),
  getMedPackageById
);

/**
 * @swagger
 * /api/v1/master/med-package:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Med Package]
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
medPackageRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_PACKAGE", "VIEW"),
    getPermission("PMS", "MEDICINE_PACKAGE", "UPDATE")
  ),
  validateMedPackageUpdate,
  updateMedPackage
);

export default medPackageRouter;
