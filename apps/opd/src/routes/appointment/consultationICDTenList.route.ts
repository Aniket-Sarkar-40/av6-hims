import {
  createConsultationICDTenList,
  updateConsultationICDTenList,
} from "@/controllers/appointment/consultationICDTenList.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateConsultationICDTenListCreate,
  validateConsultationICDTenListUpdate,
} from "@/validations/request/appointment/consultationICDTenList.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const consultationICDTenListRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: ConsultationICDTen
 *   description: ConsultationICDTen management endpoints
 */

/**
 * @swagger
 * /api/v1//appointments/consultation-icd-ten-list:
 *   post:
 *     summary: Create a  Consultation ICD Ten List
 *     tags: [Consultation ICD Ten List]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/consultationICDTenListCreateSchema'
 */
consultationICDTenListRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CONSULTATION_ICD_TEN_LIST", "CREATE")),
  validateConsultationICDTenListCreate,
  createConsultationICDTenList,
);

/**
 * @swagger
 * /api/v1/appointment/consultation-icd-ten-list-:
 *   post:
 *     summary: Update a  ConsultationICDTen
 *     tags: [ConsultationICDTen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/consultationICDTenListUpdateSchema'
 */
consultationICDTenListRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CONSULTATION_ICD_TEN_LIST", "UPDATE")),
  validateConsultationICDTenListUpdate,
  updateConsultationICDTenList,
);
