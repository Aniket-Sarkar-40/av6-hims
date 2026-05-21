import {
  getCorporateClientByCcId,
  getLastAppointments,
  getMedicineInstByAppointment,
  getOpdByAppointment,
  getPendingMedicineAppointments,
  getPendingMedicineAppointmentsExcel,
  printInstructionByAppointmentId,
} from "@/controllers/opd/opdList.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateOPD } from "@/validations/request/opd/opd.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const opdListRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments Medicine List
 *   description: Appointments Medicine List management endpoints
 */

/**
 * @swagger
 * /api/v1/opdList:
 *   post:
 *     summary: Create a new Appointments Medicine List
 *     tags: [Appointments Medicine List]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/opdListSchema'
 */
opdListRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "OPD_LIST", "VIEW")),
  getPendingMedicineAppointments
);
opdListRouter.post(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "OPD_LIST", "VIEW")),
  getPendingMedicineAppointmentsExcel
);

opdListRouter.post(
  "/appointment",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "OPD_LIST", "VIEW")),
  validateOPD,
  getOpdByAppointment
);

opdListRouter.post(
  "/med-dosage",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "OPD_LIST", "VIEW")),
  printInstructionByAppointmentId
);

opdListRouter.get(
  "/med-dosage",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "OPD_LIST", "VIEW")),
  getMedicineInstByAppointment
);

opdListRouter.get(
  "/corporate-client",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CLIENT_MASTER", "VIEW")),
  getCorporateClientByCcId
);

opdListRouter.get(
  "/last-appointments",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "OPD_LIST", "VIEW")),
  getLastAppointments
);
