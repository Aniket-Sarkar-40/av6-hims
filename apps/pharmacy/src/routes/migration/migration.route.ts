import { createMigration } from "@/controllers/migration/migration.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateCreateMigration } from "@/validations/request/migration/migration.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const migrationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *  name: Migration
 *  description: Migration endpoints
 */

/**
 * @swagger
 * /api/v1/migration:
 *  post:
 *    summary: Create a new migration
 *    tags: [Migration]
 *    security:
 *     - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/createMigrationSchema'
 */

migrationRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MIGRATION", "CREATE")),
  validateCreateMigration,
  createMigration
);
