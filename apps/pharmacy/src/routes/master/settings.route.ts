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

const settingsRouter: Router = Router();

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
 *     summary: Create a new Settings
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
  authorize(getPermission("PMS", "SETTING", "CREATE")),
  validateSettings,
  upsertSettings,
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
  verifyToken,
  authorize(getPermission("PMS", "SETTING", "VIEW")),
  getSettings,
);

export default settingsRouter;
