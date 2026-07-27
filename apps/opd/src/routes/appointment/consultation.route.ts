import { createConsultation } from "@/controllers/appointment/consultation.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateCreateConsultation } from "@/validations/request/appointment/consultation.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const consultationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consultation
 *   description: Consultation management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/consultation:
 *   post:
 *     summary: Create a Consultation
 *     tags: [Consultation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/consultationSchema'
 */
consultationRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CONSULTATION", "CREATE")),
  validateCreateConsultation,
  createConsultation,
);
