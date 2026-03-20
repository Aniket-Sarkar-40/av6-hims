import {
  createDoctor,
  updateDoctor,
} from "@/controllers/doctor/doctor.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateDoctorCreate,
  validateDoctorUpdate,
} from "@/validations/request/doctor/doctor.validation.js";
import { Router } from "express";

export const doctorRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Doctor management endpoints
 */

/**
 * @swagger
 * /api/v1/doctor:
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/doctorSchema'
 */
doctorRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "DOCTOR", "CREATE")),
  validateDoctorCreate,
  createDoctor,
);

/**
 * @swagger
 * /api/v1/doctor:
 *   put:
 *     summary: Update a doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/doctorSchema'
 */
doctorRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("OPD", "DOCTOR", "UPDATE"),
    getPermission("OPD", "DOCTOR", "VIEW"),
  ),
  validateDoctorUpdate,
  updateDoctor,
);
