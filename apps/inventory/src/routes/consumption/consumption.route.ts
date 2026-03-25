import {
  approveConsumption,
  createConsumption,
  deleteConsumptionById,
  getAllConsumption,
  getConsumptionById,
  getConsumptionByUserId,
  rejectConsumption,
  updateConsumption,
} from "@/controllers/consumption/cosumption.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import {
  validateApproveConsumption,
  validateCommonConsumptionInput,
  validateCreateConsumption,
  validateUpdateConsumption,
} from "@/validations/request/consumption/consumption.validation";
import { Router } from "express";

export const consumptionRouter = Router();

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
  verifyToken,
  authorize(getPermission("CONSUMPTION", "CREATE")),
  validateCreateConsumption,
  createConsumption
);

/**
 * @swagger
 * /api/v1/consumption/:
 *  put:
 *  summary: Update a Consumption
 *  tags: [Consumption]
 *  security:
 *    - bearerAuth: []
 * requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/approveConsumptionSchema'
 */

consumptionRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("CONSUMPTION", "UPDATE")),
  validateUpdateConsumption,
  updateConsumption
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
consumptionRouter.get("/", verifyToken, authorize(getPermission("CONSUMPTION", "VIEW")), getAllConsumption);

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
consumptionRouter.get("/id", verifyToken, authorize(getPermission("CONSUMPTION", "VIEW")), getConsumptionById);

/**
 * @swagger
 * /api/v1/consumption/approve:
 *  put:
 *  summary: Approve a Consumption
 *  tags: [Consumption]
 *  security:
 *    - bearerAuth: []
 * requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/approveConsumptionSchema'
 */

consumptionRouter.put(
  "/approve",
  verifyToken,
  authorize(getPermission("CONSUMPTION", "APPROVE")),
  validateApproveConsumption,
  approveConsumption
);

/**
 *@swagger
 * /api/v1/consumption/{consumptionId}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 * requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/commonConsumptionInputSchema'
 */
consumptionRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("CONSUMPTION", "DELETE")),
  validateCommonConsumptionInput,
  deleteConsumptionById
);

/**
 *@swagger
 * /api/v1/consumption/{consumptionId}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Consumption]
 *   security:
 *     - bearerAuth: []
 * requestBody:
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/commonConsumptionInputSchema'
 */
consumptionRouter.put(
  "/reject",
  verifyToken,
  authorize(getPermission("CONSUMPTION", "REJECT")),
  validateCommonConsumptionInput,
  rejectConsumption
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

consumptionRouter.get("/by-user", verifyToken, authorize(getPermission("CONSUMPTION", "VIEW")), getConsumptionByUserId);
