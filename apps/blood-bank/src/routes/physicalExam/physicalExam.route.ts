import { upsertPhysicalExam } from "@/controllers/physicalExam/physicalExam.controller.js";
import { validateUpsertPhysicalExam } from "@/validations/request/physicalExam/physicalExam.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const physicalExamRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Physical Exam
 *   description: Physical Exam management endpoints
 */

/**
 * @swagger
 * /api/v1/physical-exam:
 *   put:
 *     summary: Upsert a physicalExam
 *     tags: [Physical Exam]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/upsertPhysicalExam'
 */
physicalExamRouter.put(
  "/",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(
    getPermission("BLOOD_BANK", "BLOOD_DONATION_PHYSICAL_EXAM", "CREATE"),
    getPermission("BLOOD_BANK", "BLOOD_DONATION_PHYSICAL_EXAM", "UPDATE"),
  ),
  validateUpsertPhysicalExam,
  upsertPhysicalExam,
);
