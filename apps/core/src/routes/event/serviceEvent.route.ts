import {
  createServiceEvent,
  updateServiceEvent,
} from "@/controllers/event/serviceEvent.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateServiceEventCreate,
  validateServiceEventUpdate,
} from "@/validations/request/event/serviceEvent.validation.js";
import { Router } from "express";

const serviceEventRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: serviceEvent
 *   description: serviceEvent management endpoints
 */

/**
 * @swagger
 * /api/v1/serviceEvent:
 *   post:
 *     summary: Create a new serviceEvent
 *     tags: [serviceEvent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/serviceEventSchema'
 */
serviceEventRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "SERVICE_EVENT", "CREATE")),
  validateServiceEventCreate,
  createServiceEvent,
);

/**
 * @swagger
 * /api/v1/serviceEvent/{serviceEventId}:
 *   put:
 *     summary: Update a serviceEvent's details
 *     tags: [serviceEvent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceEventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The serviceEvent ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/serviceEventUpdateSchema'
 */
serviceEventRouter.put(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "SERVICE_EVENT", "UPDATE")),
  validateServiceEventUpdate,
  updateServiceEvent,
);

export default serviceEventRouter;
