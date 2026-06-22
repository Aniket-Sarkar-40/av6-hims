import {
  createHospital,
  getAllHospital,
  getHospitalById,
  toggleActiveHospital,
  updateHospital,
} from "@/controllers/master/hospital.controller.js";
import { validateToggleActive } from "@/validations/request/common.validation.js";
import { validateHospital } from "@/validations/request/master/hospital.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const hospitalRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Hospital
 *   description: Hospital management endpoints
 */

/**
 * @swagger
 * /api/v1/master/hospital:
 *   post:
 *     summary: Create a new Hospital
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/hospitalSchema'
 */
hospitalRouter.post(
  "/",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "HOSPITAL", "CREATE")),
  validateHospital,
  createHospital
);

/**
 * @swagger
 * /api/v1/master/hospital:
 *   get:
 *     summary: Retrieve a list of hospital
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 */
hospitalRouter.get(
  "/",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "HOSPITAL", "VIEW")),
  getAllHospital
);

/**
 * @swagger
 * /api/v1/master/hospital/id:
 *   get:
 *     summary: Retrieve a single Hospital
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
hospitalRouter.get(
  "/id",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(getPermission("BLOOD_BANK", "HOSPITAL", "VIEW")),
  getHospitalById
);

/**
 * @swagger
 * /api/v1/master/hospital:
 *   put:
 *     summary: Update a hospital's details
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Hospital ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/hospitalSchemaUpdate'
 */
hospitalRouter.put(
  "/",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(
    getPermission("BLOOD_BANK", "HOSPITAL", "VIEW"),
    getPermission("BLOOD_BANK", "HOSPITAL", "UPDATE")
  ),
  validateHospital,
  updateHospital
);

/**
 * @swagger
 * /api/v1/master/hospital/toggle-active:
 *   post:
 *     summary: active or Re-active a single hospital
 *     tags: [Hospital]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/toggleActiveSchema'
 */
hospitalRouter.post(
  "/toggle-active",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(
    getPermission("BLOOD_BANK", "HOSPITAL", "VIEW"),
    getPermission("BLOOD_BANK", "HOSPITAL", "UPDATE")
  ),
  validateToggleActive,
  toggleActiveHospital
);

export default hospitalRouter;
