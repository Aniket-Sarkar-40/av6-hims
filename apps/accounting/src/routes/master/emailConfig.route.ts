import { upsertEmailConfig } from "@/controllers/master/emailConfig.controller.js";
import { validateEmailConfig } from "@/validations/request/master/emailConfig.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/client";
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
 * /master/email-config:
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
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "EMAIL_CONFIG", "CREATE")),
  validateEmailConfig,
  upsertEmailConfig
);
