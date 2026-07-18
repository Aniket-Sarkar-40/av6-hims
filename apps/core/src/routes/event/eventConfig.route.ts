import {
  createEventConfig,
  markReadNotifications,
} from "@/controllers/event/eventConfig.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateMarkReadNotifications,
  validateUpsertEventConfigWithKeys,
} from "@/validations/request/event/eventConfig.validation.js";
import { Router } from "express";

const eventConfigRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: eventConfig
 *   description: Event Config management endpoints
 */

/**
 * @swagger
 * /api/v1/eventConfig:
 *   post:
 *     summary: Create a new event config
 *     tags: [eventConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/eventConfigSchema'
 */
eventConfigRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "EVENT_CONFIG", "CREATE")),
  validateUpsertEventConfigWithKeys,
  createEventConfig,
);

/**
 * @swagger
 * /api/v1/eventConfig/notification:
 *   post:
 *     summary: Create a new event config
 *     tags: [eventConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/markReadNotificationsSchema'
 */
eventConfigRouter.post(
  "/notification",
  verifyToken(),
  authorize(getPermission("CORE", "NOTIFICATION", "VIEW")),
  validateMarkReadNotifications,
  markReadNotifications,
);

export default eventConfigRouter;
