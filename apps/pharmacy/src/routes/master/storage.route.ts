import {
  createStorage,
  getAllStorage,
  getStorageById,
  updateStorage,
} from "@/controllers/master/storage.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateDropDownName,
  validateDropDownNameUpdate,
} from "@/validations/request/master/dropDown.validation.js";
import { Router } from "express";

const storage: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Storage
 *   description: Storage endpoints
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
 *             $ref: '#/components/dropDownNameSchema'
 */

storage.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "STORAGE", "CREATE")),
  validateDropDownName,
  createStorage,
);

/**
 * @swagger
 * /api/v1/master/storage:
 *   put:
 *     summary: Update a Storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/dropDownNameSchemaUpdate'
 */

storage.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "STORAGE", "VIEW"),
    getPermission("PMS", "STORAGE", "UPDATE"),
  ),
  validateDropDownNameUpdate,
  updateStorage,
);

/**
 * @swagger
 * /api/v1/master/storage:
 *   get:
 *     summary: Retrieve all Storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 */

storage.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "STORAGE", "VIEW")),
  getAllStorage,
);

/**
 * @swagger
 * /api/v1/master/storage/id:
 *   get:
 *     summary: Retrieve a single Storage
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Storage ID.
 */

storage.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "STORAGE", "VIEW")),
  getStorageById,
);
export default storage;
