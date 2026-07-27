import {
  createConsultationNotesMapping,
  updateConsultationNotesMapping,
} from "@/controllers/master/consultationNotesMapping.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateConsultationNotesMappingCreate,
  validateConsultationNotesMappingUpdate,
} from "@/validations/request/master/consultationNotesMapping.validation.js";

import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const consultationNotesMappingRouter: Router = Router();

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
consultationNotesMappingRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CONSULTATION_NOTES_MAPPING", "CREATE")),
  validateConsultationNotesMappingCreate,
  createConsultationNotesMapping,
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
consultationNotesMappingRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CONSULTATION_NOTES_MAPPING", "UPDATE")),
  validateConsultationNotesMappingUpdate,
  updateConsultationNotesMapping,
);
