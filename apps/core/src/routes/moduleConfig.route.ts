import { Router } from "express";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";

import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateModuleConfig } from "@/validations/request/moduleConfig.validation.js";
import { createOrUpdateModuleConfig } from "@/controllers/moduleConfig.controller.js";

export const moduleConfigRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Module Config
 *   description: Module config endpoints
 */

/**
 * @swagger
 * /api/v1/module-config:
 *   post:
 *     summary: update module config
 *     tags: [Module]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/CreateOrUpdateModuleConfig'
 */
moduleConfigRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "MODULE_CONFIG", "UPDATE")),
  validateModuleConfig,
  createOrUpdateModuleConfig,
);
