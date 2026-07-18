import {
  createStore,
  getAllStore,
  updateStore,
} from "@/controllers/master/store.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateStore,
  validateUpdateStore,
} from "@/validations/request/master/store.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const storeRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Store
 *   description: Store management endpoints
 */

/**
 * @swagger
 * /api/v1/master/store:
 *   post:
 *     summary: Create a new Store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createStoreSchema'
 */
storeRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE", "CREATE")),
  validateCreateStore,
  createStore,
);

/**
 * @swagger
 * /api/v1/master/store:
 *   get:
 *     summary: Retrieve a list of Store
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 */
storeRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE", "VIEW")),
  getAllStore,
);

/**
 * @swagger
 * /api/v1/master/store:
 *   put:
 *     summary: Update a Store's details
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Store ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateStoreSchema'
 */
storeRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "STORE", "VIEW"),
    getPermission("PMS", "STORE", "UPDATE"),
  ),
  validateUpdateStore,
  updateStore,
);
