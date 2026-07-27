import {
  getAllTimeSlots,
  getAllWeekIds,
} from "@/controllers/slot/timeSlot.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateTimeSlot,
  validateWeekId,
} from "@/validations/request/timeSlot/timeSlot.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const timeSlotRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: TimeSlot
 *   description: TimeSlot management endpoints
 */

/**
 * @swagger
 * /api/v1/master/time-slot:
 *   post:
 *     summary: Create or Update TimeSlot
 *     tags: [TimeSlot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/settingsSchema'
 */
timeSlotRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "TIME_SLOT", "VIEW")),
  validateTimeSlot,
  getAllTimeSlots,
);
/**
 * @swagger
 * /api/v1/master/time-slot:
 *   post:
 *     summary: Create or Update TimeSlot
 *     tags: [TimeSlot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/settingsSchema'
 */
timeSlotRouter.post(
  "/weeks",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "TIME_SLOT", "VIEW")),
  validateWeekId,
  getAllWeekIds,
);
