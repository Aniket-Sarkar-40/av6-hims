import { Router } from "express";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  createReferToDoctor,
  updateReferToDoctor,
} from "@/controllers/appointment/referToDoctor.controller.js";
import {
  validateCreateReferToDoctor,
  validateUpdateReferToDoctor,
} from "@/validations/request/appointment/referToDoctor.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const referToDoctorRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Refer To Doctor
 *   description: Refer To Doctor management endpoints
 */

/**
 * @swagger
 * /api/v1/refer-to-doctor:
 *   post:
 *     summary: Create a Refer To Doctor
 *     tags: [Refer To Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createReferToDoctorSchema'
 */
referToDoctorRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "REFER_TO_DOCTOR", "CREATE")),
  validateCreateReferToDoctor,
  createReferToDoctor
);

/**
 * @swagger
 * /api/v1/refer-to-doctor:
 *   put:
 *     summary: Update a Refer To Doctor
 *     tags: [Refer To Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateReferToDoctorSchema'
 */
referToDoctorRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "REFER_TO_DOCTOR", "UPDATE"),
    getPermission("OPD", "REFER_TO_DOCTOR", "VIEW")
  ),
  validateUpdateReferToDoctor,
  updateReferToDoctor
);
