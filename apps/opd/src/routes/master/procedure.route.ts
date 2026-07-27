import {
  createProcedure,
  fetchProcedure,
  getProcedureById,
  updateProcedure,
} from "@/controllers/master/procedure.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateProcedureSchema,
  validateFetchProcedureSchema,
  validateUpdateProcedureSchema,
} from "@/validations/request/master/procedure.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const procedureRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Procedure
 *   description: Procedure management endpoints
 */

/**
 * @swagger
 * /api/v1/master/procedure:
 *   post:
 *     summary: Create a new Procedure
 *     tags: [Procedure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createProcedureSchema'
 */
procedureRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PROCEDURE", "CREATE")),
  validateCreateProcedureSchema,
  createProcedure,
);

/**
 * @swagger
 * /api/v1/master/procedure:
 *   put:
 *     summary: Update a Procedure
 *     tags: [Procedure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateProcedureSchema'
 */
procedureRouter.put(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(
    getPermission("OPD", "PROCEDURE", "VIEW"),
    getPermission("OPD", "PROCEDURE", "UPDATE"),
  ),
  validateUpdateProcedureSchema,
  updateProcedure,
);

/**
 * @swagger
 * /api/v1/master/procedure/id:
 *   get:
 *     summary: Retrieve a Procedure by ID
 *     tags: [Procedure]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: procedureId
 *         required: true
 *         schema:
 *           type: string
 *         description: Numeric ID of the Procedure to get
 */
procedureRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PROCEDURE", "VIEW")),
  getProcedureById,
);

/**
 * @swagger
 * /api/v1/master/procedure/fetch:
 *   get:
 *     summary: Retrieve a procedure with co pay settings
 *     tags: [Procedure]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/fetchProcedureSchema'
 */
procedureRouter.post(
  "/fetch",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PROCEDURE", "VIEW")),
  validateFetchProcedureSchema,
  fetchProcedure,
);
