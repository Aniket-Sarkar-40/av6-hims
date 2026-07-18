import {
  createDefaultUnitMaster,
  updateDefaultUnitMaster,
} from "@/controllers/master/defaultUnitMaster.controller.js";
import {
  validateDefaultUnitMasterCreate,
  validateDefaultUnitMasterUpdate,
} from "@/validations/request/master/defaultUnitMaster.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const defaultUnitMasterRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Default Unit Master
 *   description: Default Unit Master management endpoints
 */

/**
 * @swagger
 * /api/v1/master/default-unit-master:
 *   post:
 *     summary: Create a new Default Unit Master
 *     tags: [Default Unit Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/defaultUnitMasterSchema'
 */
defaultUnitMasterRouter.post(
  "/",
  verifyToken("INVENTORY"),
  authorize(getPermission("INV", "DEFAULT_UNIT_MASTER", "CREATE")),
  validateDefaultUnitMasterCreate,
  createDefaultUnitMaster,
);

/**
 * @swagger
 * /api/v1/master/default-unit-master:
 *   put:
 *     summary: Update a Default Unit Master's details
 *     tags: [Default Unit Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: defaultUnitMasterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The default unit master ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/defaultUnitMasterSchemaUpdate'
 */
defaultUnitMasterRouter.put(
  "/",
  verifyToken("INVENTORY"),
  authorize(
    getPermission("INV", "DEFAULT_UNIT_MASTER", "VIEW"),
    getPermission("INV", "DEFAULT_UNIT_MASTER", "UPDATE"),
  ),
  validateDefaultUnitMasterUpdate,
  updateDefaultUnitMaster,
);
