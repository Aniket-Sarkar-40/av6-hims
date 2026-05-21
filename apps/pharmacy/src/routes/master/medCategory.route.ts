import {
  createMedCategory,
  getAllMedCategory,
  getMedCategoryById,
  updateMedCategory,
} from "@/controllers/master/medCategory.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateMedCategoryInput,
  validateMedCategoryInputUpdate,
} from "@/validations/request/master/medCategory.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const medCategoryRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Medicine Category
 *   description: Medicine Category management endpoints
 */

/**
 * @swagger
 * /api/v1/med-category:
 *   post:
 *     summary: Create a new Medicine Category
 *     tags: [Medicine Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchema'
 */
medCategoryRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_CATEGORY", "CREATE")),
  validateMedCategoryInput,
  createMedCategory
);

/**
 * @swagger
 * /api/v1/med-category:
 *   get:
 *     summary: Retrieve a list of Medicine Category
 *     tags: [Medicine Category]
 *     security:
 *       - bearerAuth: []
 */
medCategoryRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_CATEGORY", "VIEW")),
  getAllMedCategory
);

/**
 * @swagger
 * /api/v1/med-category/{medCategoryId}:
 *   get:
 *     summary: Retrieve a single Medicine Category by ID
 *     tags: [Medicine Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The medCategory ID.
 */
medCategoryRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_CATEGORY", "VIEW")),
  getMedCategoryById
);

/**
 * @swagger
 * /api/v1/med-category/{medCategoryId}:
 *   put:
 *     summary: Update a Medicine Category's details
 *     tags: [Medicine Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The medCategory ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchemaUpdate'
 */
medCategoryRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_CATEGORY", "VIEW"),
    getPermission("PMS", "MEDICINE_CATEGORY", "UPDATE")
  ),
  validateMedCategoryInputUpdate,
  updateMedCategory
);

export default medCategoryRouter;
