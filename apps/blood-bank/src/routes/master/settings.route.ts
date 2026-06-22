import {
  getSettings,
  upsertSettings,
} from "@/controllers/master/settings.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateSettings } from "@/validations/request/master/settings.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const settingsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management endpoints
 */

/**
 * @swagger
 * /api/v1/master/settings:
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
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "SETTING", "CREATE")),
  validateSettings,
  upsertSettings
);

/**
 * @swagger
 * /api/v1/master/settings:
 *   get:
 *     summary: Retrieve a list of Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
settingsRouter.get(
  "/",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "SETTING", "VIEW")),
  getSettings
);
