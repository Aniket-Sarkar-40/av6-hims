import {
  createAuditConfig,
  updateAuditConfig,
} from "@/controllers/master/auditConfig.controller.js";
import {
  validateAuditConfigCreate,
  validateAuditConfigUpdate,
} from "@/validations/request/master/auditConfig.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const auditConfigRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: AuditConfig
 *   description: Audit configuration management endpoints
 */

/**
 * @swagger
 * /api/v1/master/audit-config:
 *   post:
 *     summary: Create a new Audit Config
 *     tags: [AuditConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAuditConfig'
 */
auditConfigRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "AUDIT_CONFIG", "CREATE")),
  validateAuditConfigCreate,
  createAuditConfig
);

/**
 * @swagger
 * /api/v1/master/audit-config:
 *   put:
 *     summary: Update an Audit Config
 *     tags: [AuditConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAuditConfig'
 */
auditConfigRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "AUDIT_CONFIG", "UPDATE")),
  validateAuditConfigUpdate,
  updateAuditConfig
);
