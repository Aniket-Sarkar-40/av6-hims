import { createFollowUp } from "@/controllers/appointment/followUp.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateCreateFollowUp } from "@/validations/request/appointment/followUp.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
export const followUpRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Follow Up
 *   description: Follow Up management endpoints
 */

/**
 * @swagger
 * /api/v1/follow-up:
 *   post:
 *     summary: Create a Follow Up
 *     tags: [Follow Up]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/followUpSchema'
 */

followUpRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "FOLLOW_UP", "CREATE")),
  validateCreateFollowUp,
  createFollowUp,
);
