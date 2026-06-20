import {
  cancelAppointment,
  createAppointment,
  getAllAppointment,
  getAppointmentById,
  getAppointmentFees,
  rescheduleAppointment,
  updateAppointment,
  upgradeAppointment,
} from "@/controllers/appointment/appointment.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateAppointments,
  validateAppointmentUpdate,
  validategetAppointmentFees,
  validateRescheduledAppointment,
  validateUpgradeAppointment,
} from "@/validations/request/appointment/appointment.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const appointmentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointment
 *   description: appointment endpoints
 */

/**
 * @swagger
 * /api/v1/appointment:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/appointmentCreateSchema'
 */
appointmentRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "APPOINTMENT", "CREATE")),
  validateAppointments,
  createAppointment
);

/**
 * @swagger
 * /api/v1/appointment:
 *   put:
 *     summary: Update a appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/appointmentUpdateSchema'
 */
appointmentRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "APPOINTMENT", "VIEW"),
    getPermission("OPD", "APPOINTMENT", "UPDATE")
  ),
  validateAppointmentUpdate,
  updateAppointment
);

/**
 * @swagger
 * /api/v1/appointment:
 *   get:
 *     summary: get all appointments
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 */
appointmentRouter.get(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "APPOINTMENT", "VIEW")),
  getAllAppointment
);

/**
 * @swagger
 * /api/v1/appointment/id:
 *   get:
 *     summary: Retrieve a single appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getAppointmentStockReqSchema'
 */
appointmentRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "APPOINTMENT", "VIEW")),
  getAppointmentById
);

/**
 * @swagger
 * /api/v1/appointment/{id}:
 *   delete:
 *     summary: Delete a single Appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 */
appointmentRouter.delete(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "APPOINTMENT", "DELETE")),
  cancelAppointment
);

/**
 * @swagger
 * /api/v1/appointment:
 *   put:
 *     summary: Rescheduled a appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/appointmentRescheduledSchema'
 */
appointmentRouter.put(
  "/reschedule",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "APPOINTMENT", "VIEW"),
    getPermission("OPD", "APPOINTMENT", "UPDATE")
  ),
  validateRescheduledAppointment,
  rescheduleAppointment
);

/**
 * @swagger
 * /api/v1/appointment/upgrade:
 *   put:
 *     summary: Upgrade a appointment
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/upgradeAppointmentSchema'
 */
appointmentRouter.post(
  "/upgrade",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "APPOINTMENT", "VIEW"),
    getPermission("OPD", "APPOINTMENT", "UPDATE")
  ),
  validateUpgradeAppointment,
  upgradeAppointment
);
/**
 * @swagger
 * /api/v1/appointment/fees:
 *   post:
 *     summary: Get Appointment Fees
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/getAppointmentFeesSchema'
 */

appointmentRouter.post(
  "/fees",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "DOCTOR_FEES", "VIEW")),
  validategetAppointmentFees,
  getAppointmentFees
);
