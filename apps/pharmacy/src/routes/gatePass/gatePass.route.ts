import {
  createGatePass,
  deleteGatePass,
  excelGatePassReport,
  getAllGatePass,
  getGatePassById,
  getGatePassPdfById,
  updateGatePass,
} from "@/controllers/gatePass/gatePass.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateGatePass,
  validateGatePassFilter,
  validateGatePassUpdate,
} from "@/validations/request/gatePass/gatePass.validation.js";

import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const gatePassRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Gate Pass
 *   description: Gate Pass management endpoints
 */

/**
 * @swagger
 * /api/v1/gatePass:
 *   post:
 *     summary: Create a new Gate Pass
 *     tags: [Gate Pass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/gatePassSchema'
 */
gatePassRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GATE_PASS", "CREATE")),
  validateGatePass,
  createGatePass
);

/**
 * @swagger
 * /api/v1/gatePass:
 *   get:
 *     summary: Retrieve a list of Gate Pass
 *     tags: [Gate Pass]
 *     security:
 *       - bearerAuth: []
 */
gatePassRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GATE_PASS", "VIEW")),
  getAllGatePass
);

/**
 * @swagger
 * /api/v1/gatePass/id:
 *   get:
 *     summary: Retrieve a single Gate Pass
 *     tags: [Gate Pass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gatePassId
 *         required: true
 *         schema:
 *           type: string
 *         description: The gatePass ID.
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
gatePassRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GATE_PASS", "VIEW")),
  getGatePassById
);

/**
 * @swagger
 * /api/v1/gatePass:
 *   put:
 *     summary: Update a Gate Pass's  details
 *     tags: [Gate Pass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/gatePassSchemaUpdate'
 */
gatePassRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "GATE_PASS", "VIEW"),
    getPermission("PMS", "GATE_PASS", "UPDATE")
  ),
  validateGatePassUpdate,
  updateGatePass
);

/**
 * @swagger
 * /api/v1/gatePass/{gatePassId=id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Gate Pass]
 *     parameters:
 *       - in: query
 *         name: gatePassId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource to delete.
 */
gatePassRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GATE_PASS", "DELETE")),
  deleteGatePass
);

/**
 * @swagger
 * /api/v1/gatePass/pdf{gatePassId=id}:
 *   post:
 *     summary: Generate a single Gate Pass
 *     tags: [Gate Pass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gatePassId
 *         required: true
 *         schema:
 *           type: string
 *         description: The gatePass ID.
 */
gatePassRouter.post(
  "/pdf",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GATE_PASS_PDF", "VIEW")),
  getGatePassPdfById
);

gatePassRouter.post(
  "/excel",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GATE_PASS_EXCEL", "VIEW")),
  validateGatePassFilter,
  excelGatePassReport
);
