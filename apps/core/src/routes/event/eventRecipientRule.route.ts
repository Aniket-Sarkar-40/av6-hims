import {
  createEventRecipientRule,
  multiCreateUpdateEventRecipientRule,
  updateEventRecipientRule,
} from "@/controllers/event/eventRecipientRule.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateRecipientRuleCreate,
  validateRecipientRuleMultiCreateUpdate,
  validateRecipientRuleUpdate,
} from "@/validations/request/event/eventRecipientRule.validation.js";
import { Router } from "express";

const eventRecipientRuleRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: eventRecipientRule
 *   description: Event Recipient Rule management endpoints
 */

/**
 * @swagger
 * /api/v1/rule:
 *   post:
 *     summary: Create a new event recipient rule
 *     tags: [eventRecipientRule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/eventRecipientRuleCreateSchema'
 */
eventRecipientRuleRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "EVENT_RECIPIENT_RULE", "CREATE")),
  validateRecipientRuleCreate,
  createEventRecipientRule
);

/**
 * @swagger
 * /api/v1/rule:
 *   put:
 *     summary: Update an existing event recipient rule
 *     tags: [eventRecipientRule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/eventRecipientRuleUpdateSchema'
 */
eventRecipientRuleRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "EVENT_RECIPIENT_RULE", "UPDATE")),
  validateRecipientRuleUpdate,
  updateEventRecipientRule
);

/**
 * @swagger
 * /api/v1/rule/multi-create-update:
 *   post:
 *     summary: Create a new event recipient rule
 *     tags: [eventRecipientRule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/eventRecipientRuleCreateSchema'
 */
eventRecipientRuleRouter.post(
  "/multi-create-update",
  verifyToken,
  authorize(
    getPermission("CORE", "EVENT_RECIPIENT_RULE", "CREATE"),
    getPermission("CORE", "EVENT_RECIPIENT_RULE", "UPDATE")
  ),
  validateRecipientRuleMultiCreateUpdate,
  multiCreateUpdateEventRecipientRule
);

export default eventRecipientRuleRouter;
