import {
  createAutoAlertEmail,
  resendAutoAlertEmail,
  updateAutoAlertEmail,
} from "@/controllers/master/autoAlert.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateAutoAlertEmail,
  validateUpdateAutoAlertEmail,
} from "@/validations/request/master/autoAlert.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
export const autoAlertRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: AutoAlert
 *   description: AutoAlert management endpoints
 */

/**
 * @swagger
 * /api/v1/master/auto-alert:
 *   post:
 *     summary: Create a new AutoAlert
 *     tags: [AutoAlert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createAutoAlertEmailSchema'
 */
autoAlertRouter.post(
  "/email",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "AUTO_ALERT", "CREATE")),
  validateCreateAutoAlertEmail,
  createAutoAlertEmail
);

/**
 * @swagger
 * /api/v1/master/auto-alert:
 *   put:
 *     summary: Update AutoAlert
 *     tags: [AutoAlert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateAutoAlertEmailSchema'
 */
autoAlertRouter.put(
  "/email",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "AUTO_ALERT", "UPDATE"),
    getPermission("PMS", "AUTO_ALERT", "VIEW")
  ),
  validateUpdateAutoAlertEmail,
  updateAutoAlertEmail
);

/**
 * @swagger
 * /api/v1/master/auto-alert/email-resend:
 *   put:
 *     summary: Resend AutoAlert Email
 *     tags: [AutoAlert]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: auditId
 *         required: true
 *         schema:
 *           type: string
 *         description: The audit ID.
 */
autoAlertRouter.put(
  "/email-resend",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "AUTO_ALERT", "UPDATE"),
    getPermission("PMS", "AUTO_ALERT", "VIEW")
  ),
  resendAutoAlertEmail
);
