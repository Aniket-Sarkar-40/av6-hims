import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "@/controllers/staff/doctor.controller.js";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateDoctor } from "@/validations/request/staff/doctor.validation.js";
import { Router } from "express";

export const doctorRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: doctor
 *   description: doctor management endpoints
 */

/**
 * @swagger
 * /api/v1/doctor:
 *   post:
 *     summary: Create a new doctor
 *     tags: [doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/doctorSchema'
 */
// POST /doctors
doctorRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "DOCTOR", "CREATE")),
  validateDoctor,
  createDoctor
);

/**
 * @swagger
 * /api/v1/doctor:
 *   get:
 *     summary: Retrieve a list of doctors.
 *     tags: [doctor]
 *     security:
 *       - bearerAuth: []
 */
// GET /doctors
doctorRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "DOCTOR", "VIEW")),
  getAllDoctors
);

/**
 * @swagger
 * /api/v1/doctor/{doctorId}:
 *   get:
 *     summary: Retrieve a single doctor by ID.
 *     tags: [doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID.
 */
// GET /doctors/:doctorId
doctorRouter.get(
  "/:doctorId",
  verifyToken,
  authorize(getPermission("CORE", "DOCTOR", "VIEW")),
  getDoctorById
);

/**
 * @swagger
 * /api/v1/doctor/:
 *   put:
 *     summary: Update an doctor's details.
 *     tags: [doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/doctorSchema'
 */
// PUT /doctors/:doctorId
doctorRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("CORE", "DOCTOR", "VIEW"),
    getPermission("CORE", "DOCTOR", "UPDATE")
  ),
  validateDoctor,
  updateDoctor
);

/**
 * @swagger
 * /api/v1/doctor/{doctorId}:
 *   delete:
 *     summary: Delete an doctor.
 *     tags: [doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID to delete.
 */
// DELETE /doctors/:doctorId
doctorRouter.delete(
  "/:doctorId",
  verifyToken,
  authorize(getPermission("CORE", "DOCTOR", "DELETE")),
  deleteDoctor
);

export default doctorRouter;
