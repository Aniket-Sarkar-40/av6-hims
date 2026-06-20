import {
  getSettings,
  upsertSettings,
} from "@/controllers/settings/settings.controller.js";
import { validateSettings } from "@/validations/request/settings/settings.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const settingsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management endpoints
 */

/**
 * @swagger
 * /api/v1/settings:
 *   post:
 *     summary: Create or Update Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/settingsSchema'
 */
settingsRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "SETTINGS", "CREATE")),
  validateSettings,
  upsertSettings
);

/**
 * @swagger
 * /api/v1/settings:
 *   post:
 *     summary: Create or Update Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/settingsSchema'
 */
settingsRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "SETTINGS", "VIEW")),
  getSettings
);
