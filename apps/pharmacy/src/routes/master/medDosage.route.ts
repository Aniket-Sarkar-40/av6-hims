import {
  dosageCreate,
  getMedDosageById,
  medDosageGet,
  updateMedDosage,
} from "@/controllers/master/medDosage.controller.js";
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

export const medDosageRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Med Dosage
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-dosage:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Med Dosage]
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
medDosageRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "MEDICINE_DOSAGE", "CREATE")),
  validateDropDownName,
  dosageCreate,
);

/**
 * @swagger
 * /api/v1/master/med-dosage:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Med Dosage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
medDosageRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "MEDICINE_DOSAGE", "VIEW")),
  medDosageGet,
);

/**
 * @swagger
 * /api/v1/master/med-dosage/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Med Dosage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
medDosageRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "MEDICINE_DOSAGE", "VIEW")),
  getMedDosageById,
);

/**
 * @swagger
 * /api/v1/master/med-dosage:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Med Dosage]
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
medDosageRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "MEDICINE_DOSAGE", "VIEW"),
    getPermission("PMS", "MEDICINE_DOSAGE", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateMedDosage,
);

export default medDosageRouter;
