import { upsertBloodCollection } from "@/controllers/bloodCollection/bloodCollection.controller.js";
import { validateUpsertBloodCollection } from "@/validations/request/bloodCollection/bloodCollection.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const bloodCollectionRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Blood Collection
 *   description: Blood Collection management endpoints
 */

/**
 * @swagger
 * /api/v1/blood-collection:
 *   post:
 *     summary: Create a bloodCollection
 *     tags: [Blood Collection]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/validateUpsertBloodCollection'
 */
bloodCollectionRouter.post(
  "/",
  verifyToken(ServiceCode.BLOOD_BANK),
  authorize(
    getPermission("BLOOD_BANK", "BLOOD_COLLECTION", "CREATE"),
    getPermission("BLOOD_BANK", "BLOOD_COLLECTION", "UPDATE"),
  ),
  validateUpsertBloodCollection,
  upsertBloodCollection,
);
