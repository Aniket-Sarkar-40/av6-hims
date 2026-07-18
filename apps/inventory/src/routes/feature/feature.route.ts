import {
  createFeatureFlag,
  deleteFeatureFlag,
  getAllFeatureFlags,
  getFeatureFlagByShortCode,
  toggleFeatureFlag,
  updateFeatureFlag,
} from "@/controllers/feature/feature.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateFeatureFlag,
  validateUpdateFeatureFlag,
} from "@/validations/request/feature/feature.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

const featureRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Feature Flags
 *   description: Feature flag management endpoints
 */

/**
 * @swagger
 * /api/v1/feature:
 *   post:
 *     summary: Create a new Feature Flag
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createFeatureFlagSchema'
 */
featureRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "FEATURE_FLAG", "CREATE")),
  validateCreateFeatureFlag,
  createFeatureFlag,
);

/**
 * @swagger
 * /api/v1/feature:
 *   put:
 *     summary: Update an existing Feature Flag
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateFeatureFlagSchema'
 */
featureRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "FEATURE_FLAG", "VIEW"),
    getPermission("INV", "FEATURE_FLAG", "UPDATE"),
  ),
  validateUpdateFeatureFlag,
  updateFeatureFlag,
);

/**
 * @swagger
 * /api/v1/feature:
 *   get:
 *     summary: Retrieve all Feature Flags
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 */
featureRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "FEATURE_FLAG", "VIEW")),
  getAllFeatureFlags,
);

/**
 * @swagger
 * /api/v1/feature/shortCode:
 *   get:
 *     summary: Retrieve a Feature Flag by shortCode
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 */
featureRouter.get(
  "/shortCode",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "FEATURE_FLAG", "VIEW")),
  getFeatureFlagByShortCode,
);

/**
 * @swagger
 * /api/v1/feature/toggle-enabled:
 *   put:
 *     summary: Toggle isEnabled for a Feature Flag
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: featureFlagId
 *         required: true
 *         schema:
 *           type: integer
 */
featureRouter.put(
  "/toggle-enabled",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "FEATURE_FLAG", "VIEW"),
    getPermission("INV", "FEATURE_FLAG", "UPDATE"),
  ),
  toggleFeatureFlag,
);

/**
 * @swagger
 * /api/v1/feature:
 *   delete:
 *     summary: Delete (soft) a Feature Flag
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: featureFlagId
 *         required: true
 *         schema:
 *           type: integer
 */
featureRouter.delete(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "FEATURE_FLAG", "DELETE")),
  deleteFeatureFlag,
);

export default featureRouter;
