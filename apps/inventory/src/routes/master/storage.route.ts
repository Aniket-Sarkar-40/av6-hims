import { createStorage, updateStorage } from "@/controllers/master/storage.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { validateStorageCreate, validateStorageUpdate } from "@/validations/request/master/storage.validation";
import { Router } from "express";

export const storageRouter = Router();

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
  verifyToken,
  authorize(getPermission("STORAGE", "CREATE")),
  validateStorageCreate,
  createStorage
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
  verifyToken,
  authorize(getPermission("STORAGE", "VIEW"), getPermission("STORAGE", "UPDATE")),
  validateStorageUpdate,
  updateStorage
);
