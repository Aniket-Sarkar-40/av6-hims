import { createConsultationComplaints } from "@/controllers/appointment/consultationComplaints.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateConsultationComplaintsCreate } from "@/validations/request/appointment/consultationComplaints.validation.js";
import { Router } from "express";

export const consultationComplaintsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consultation Complaints
 *   description: Patient Consultation management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment/consultation-complaints:
 *   post:
 *     summary: Create a Consultation Complaints
 *     tags: [Consultation Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/consultationComplaintsCreateSchema'
 */
consultationComplaintsRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "CONSULTATION_COMPLAINTS", "CREATE")),
  validateConsultationComplaintsCreate,
  createConsultationComplaints,
);
