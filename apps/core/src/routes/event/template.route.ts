import {
  createTemplate,
  updateTemplate,
} from "@/controllers/event/template.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateTemplateCreate,
  validateTemplateUpdate,
} from "@/validations/request/event/template.validation.js";
import { Router } from "express";

const templateRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: template
 *   description: Template management endpoints
 */

/**
 * @swagger
 * /api/v1/template:
 *   post:
 *     summary: Create a new template
 *     tags: [template]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/templateSchema'
 */
templateRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "TEMPLATE", "CREATE")),
  validateTemplateCreate,
  createTemplate
);

/**
 * @swagger
 * /api/v1/template/{templateId}:
 *   put:
 *     summary: Update a template's details
 *     tags: [template]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The template ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/templateUpdateSchema'
 */
templateRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "TEMPLATE", "UPDATE")),
  validateTemplateUpdate,
  updateTemplate
);

export default templateRouter;
