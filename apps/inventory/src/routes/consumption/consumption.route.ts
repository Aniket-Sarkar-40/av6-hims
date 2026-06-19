import {
  createConsumption,
  getAllConsumption,
  getConsumptionById,
  getConsumptionByUserId,
} from "@/controllers/consumption/consumption.controller.js";
import { validateCreateConsumption } from "@/validations/request/consumption/consumption.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const consumptionRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consumption
 *   description: Consumption management endpoints
 */
/**
 * @swagger
 * /api/v1/consumption:
 *  post:
 *   summary: Create a new Consumption
 *  tags: [Consumption]
 *  security:
 *    - bearerAuth: []
 *  requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/consumptionSchema'
 */
consumptionRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CONSUMPTION", "CREATE")),
  validateCreateConsumption,
  createConsumption
);

/**
 * @swagger
 * /api/v1/consumption:
 *  get:
 *  summary: Get all Consumptions
 *  tags: [Consumption]
 *  security:
 *    - bearerAuth: []
 */
consumptionRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CONSUMPTION", "VIEW")),
  getAllConsumption
);

/** * @swagger
 * /api/v1/consumption/id/{consumptionId}:
 *  get:
 *  summary: Get a single Consumption
 *  tags: [Consumption]
 *  security:
 *    - bearerAuth: []
 *  parameters:
 *    - in: query
 *      name: consumptionId
 *      required: true
 *      schema:
 *        type: string
 *      description: The consumptionId of the Consumption to retrieve
 */
consumptionRouter.get(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CONSUMPTION", "VIEW")),
  getConsumptionById
);
/**
 * @swagger
 * /api/v1/consumption/by-user/{userId}:
 *   get:
 *     summary: Get Consumption by User ID
 *     tags: [Consumption]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource to get.
 */

consumptionRouter.get(
  "/by-user",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "CONSUMPTION", "VIEW")),
  getConsumptionByUserId
);
