import {
  deleteEmailConfig,
  getEmailConfig,
  getEventEmail,
  upsertEmailConfig,
} from "@/controllers/email/email.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateEmailConfig } from "@/validations/request/email/email.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

const emailConfigRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: EmailConfig
 *   description: Email configuration management endpoints
 */

/**
 * @swagger
 * /api/v1/email-config:
 *   post:
 *     summary: Create or update the email configuration
 *     tags: [EmailConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/emailConfigSchema'
 */
emailConfigRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "EMAIL", "CREATE")),
  validateEmailConfig,
  upsertEmailConfig,
);

/**
 * @swagger
 * /api/v1/email-config:
 *   get:
 *     summary: Retrieve the email configuration
 *     tags: [EmailConfig]
 *     security:
 *       - bearerAuth: []
 */
emailConfigRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "EMAIL", "VIEW")),
  getEmailConfig,
);

/**
 * @swagger
 * /api/v1/event-email:
 *   get:
 *     summary: Retrieve the event email configuration
 *     tags: [EmailConfig]
 *     security:
 *       - bearerAuth: []
 */
emailConfigRouter.get(
  "/event-email",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "EMAIL", "VIEW")),
  getEventEmail,
);

/**
 * @swagger
 * /api/v1/email-config:
 *   delete:
 *     summary: Delete the email configuration
 *     tags: [EmailConfig]
 *     security:
 *       - bearerAuth: []
 */
emailConfigRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "EMAIL", "VIEW"),
    getPermission("PMS", "EMAIL", "DELETE"),
  ),
  deleteEmailConfig,
);

export default emailConfigRouter;
