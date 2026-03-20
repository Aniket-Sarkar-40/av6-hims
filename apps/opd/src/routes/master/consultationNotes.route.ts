import {
  createConsultationNotes,
  updateConsultationNotes,
} from "@/controllers/master/consultationNotes.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateConsultationNotesCreate,
  validateConsultationNotesUpdate,
} from "@/validations/request/master/consultationNotes.validation.js";

import { Router } from "express";

export const consultationNotesRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: ConsultationNotes
 *   description: Consultation Notes management endpoints
 */

/**
 * @swagger
 * /api/v1/master/consultation-notes:
 *   post:
 *     summary: Create a new Consultation Note
 *     tags: [ConsultationNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 */
consultationNotesRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "CONSULTATION_NOTES", "CREATE")),
  validateConsultationNotesCreate,
  createConsultationNotes,
);

/**
 * @swagger
 * /api/v1/master/consultation-notes:
 *   put:
 *     summary: Update a Consultation Note
 *     tags: [ConsultationNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 */
consultationNotesRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "CONSULTATION_NOTES", "UPDATE")),
  validateConsultationNotesUpdate,
  updateConsultationNotes,
);
