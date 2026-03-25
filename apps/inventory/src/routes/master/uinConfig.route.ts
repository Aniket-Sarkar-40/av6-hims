import {
  createUINConfig,
  deleteUINConfig,
  getAllUinShortCodes,
  getUIN,
  previewCustomUIN,
  previewUIN,
  updateUINConfig,
} from "@/controllers/master/uinConfig.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import {
  validateCreateConfig,
  validateGetUINConfig,
  validatePreviewCustomConfig,
  validateUpdateConfig,
} from "@/validations/request/master/uinConfig.validation";
import { Router } from "express";

export const uinConfigRouter = Router();

/**
 * @swagger
 * tags:
 *   name: UinConfig
 *   description: UinConfig management endpoints
 */

/**
 * @swagger
 * /api/v1/master/uin-config:
 *   post:
 *     summary: Create a new UinConfig
 *     tags: [UinConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createUinConfigSchema'
 */
uinConfigRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("UIN_CONFIG", "CREATE")),
  validateCreateConfig,
  createUINConfig
);

/**
 * @swagger
 * /api/v1/master/uin-config:
 *   put:
 *     summary: Update a UinConfig
 *     tags: [UinConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateUinConfigSchema'
 */
uinConfigRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("UIN_CONFIG", "VIEW"), getPermission("UIN_CONFIG", "UPDATE")),
  validateUpdateConfig,
  updateUINConfig
);

/**
 * @swagger
 * /api/v1/master/uin-config/uin:
 *   get:
 *     summary: Update a UinConfig
 *     tags: [UinConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Short code.
 */
uinConfigRouter.get("/uin", verifyToken, authorize(getPermission("UIN_CONFIG", "VIEW")), validateGetUINConfig, getUIN);

/**
 * @swagger
 * /api/v1/master/uin-config/uin-preview:
 *   get:
 *     summary: Update a UinConfig
 *     tags: [UinConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Short code.
 */
uinConfigRouter.get(
  "/uin-preview",
  verifyToken,
  authorize(getPermission("UIN_CONFIG", "VIEW")),
  validateGetUINConfig,
  previewUIN
);

/**
 * @swagger
 * /api/v1/master/uin-config/uin-custom-preview:
 *   post:
 *     summary: Update a UinConfig
 *     tags: [UinConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/previewUinConfigSchema'
 */
uinConfigRouter.post(
  "/uin-custom-preview",
  verifyToken,
  authorize(getPermission("UIN_CONFIG", "CREATE")),
  validatePreviewCustomConfig,
  previewCustomUIN
);

/**
 * @swagger
 * /api/v1/master/uin-config/{id}:
 *   delete:
 *     summary: Delete a Uin Config by ID
 *     tags: [UinConfig]
 */
// DELETE/:shortCode/:id
uinConfigRouter.delete("/:id", verifyToken, authorize(getPermission("UIN_CONFIG", "DELETE")), deleteUINConfig);

/**
 * @swagger
 * /api/v1/master/uin-config/uin-short-code:
 *   delete:
 *     summary: Post Uin Enum Short Code
 *     tags: [UinConfig]
 */
// POST/uin-short-code
uinConfigRouter.get(
  "/uin-short-code",
  verifyToken,
  authorize(getPermission("UIN_CONFIG", "VIEW")),
  getAllUinShortCodes
);
