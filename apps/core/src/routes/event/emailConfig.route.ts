import { upsertEmailConfig } from "@/controllers/event/emailConfig.controller.js";
import { validateEmailConfig } from "@/validations/request/event/emailConfig.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";
export const emailConfigRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: EmailConfig
 *   description: Email configuration management
 */

/**
 * @swagger
 * /event/email-config:
 *   post:
 *     summary: Create or update email config
 *     tags: [EmailConfig]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrUpdateEmailConfig'
 *     responses:
 *       200:
 *         description: The updated email configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */

emailConfigRouter.post(
  "/",
  verifyToken(ServiceCode.CORE),
  authorize(getPermission("CORE", "EMAIL_CONFIG", "CREATE")),
  validateEmailConfig,
  upsertEmailConfig,
);
