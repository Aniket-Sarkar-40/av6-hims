import { getConsultationIcdList } from "@/controllers/opd/consultationIcdList.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const consultationIcdListRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consultation Icd List
 *   description: Consultation Icd List
 */

/**
 * @swagger
 * /api/v1/consultationIcdList:
 *   post:
 *     summary: Create a new Consultation Icd List
 *     tags: [Consultation Icd List]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/consultationIcdListSchema'
 */
consultationIcdListRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "CONSULTATION_ICD_LIST", "VIEW")),
  getConsultationIcdList,
);
