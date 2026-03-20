import {
  createChipsButtonMapping,
  updateChipsButtonMapping,
} from "@/controllers/master/chipsButtonMapping.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateChipsButtonMappingCreate,
  validateChipsButtonMappingUpdate,
} from "@/validations/request/master/chipsButtonMapping.validation.js";
import { Router } from "express";

export const chipsButtonMappingRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Chips Button Mapping
 *   description: Chips Button Mapping management endpoints
 */

/**
 * @swagger
 * /api/v1/master/Chips-Button-mapping:
 *   post:
 *     summary: Create a new Chips Button Mapping
 *     tags: [Chips Button Mapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/chipsButtonMappingCreateSchema'
 *             type: object
 *             properties:
 *               chipsName:
 *                 type: string
 *               doctorId:
 *                 type: int
 *
 */
chipsButtonMappingRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "CHIPS_BUTTON_MAPPING", "CREATE")),
  validateChipsButtonMappingCreate,
  createChipsButtonMapping,
);

/**
 * @swagger
 * /api/v1/master/chips-button-mapping:
 *   put:
 *     summary: Update an Chips Button Mapping
 *     tags: [Chips Button Mapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/chipsButtonMappingUpdateSchema'
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               chipsName:
 *                 type: string
 *               doctorId:
 *                 type: integer
 *
 */
chipsButtonMappingRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("OPD", "CHIPS_BUTTON_MAPPING", "UPDATE")),
  validateChipsButtonMappingUpdate,
  updateChipsButtonMapping,
);
