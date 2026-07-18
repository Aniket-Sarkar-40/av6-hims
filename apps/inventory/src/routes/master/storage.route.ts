import {
  createStorage,
  updateStorage,
} from "@/controllers/master/storage.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateStorageCreate,
  validateStorageUpdate,
} from "@/validations/request/master/storage.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const storageRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Storage
 *   description: Storage management endpoints
 */

/**
 * @swagger
 * /api/v1/master/storage:
 *   post:
 *     summary: Create a new Storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storageSchema'
 */
storageRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "STORAGE", "CREATE")),
  validateStorageCreate,
  createStorage,
);

/**
 * @swagger
 * /api/v1/master/storage:
 *   put:
 *     summary: Update a Storage's details
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The storage ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storageSchemaUpdate'
 */
storageRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "STORAGE", "VIEW"),
    getPermission("INV", "STORAGE", "UPDATE"),
  ),
  validateStorageUpdate,
  updateStorage,
);
