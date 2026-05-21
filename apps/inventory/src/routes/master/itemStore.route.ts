import {
  createItemStore,
  getAllItemStore,
  getItemStoreById,
  updateItemStore,
} from "@/controllers/master/itemStore.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateItemStoreCreate,
  validateItemStoreUpdate,
} from "@/validations/request/master/itemStore.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const itemStoreRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item Store
 *   description: Item Store management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-store:
 *   post:
 *     summary: Create a new Item Store
 *     tags: [Item Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemStoreSchema'
 */
itemStoreRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_STORE", "CREATE")),
  validateItemStoreCreate,
  createItemStore
);

/**
 * @swagger
 * /api/v1/master/item-store:
 *   get:
 *     summary: Retrieve a list of Item Store
 *     tags: [Item Store]
 *     security:
 *       - bearerAuth: []
 */
itemStoreRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_STORE", "VIEW")),
  getAllItemStore
);

/**
 * @swagger
 * /api/v1/master/item-store/id:
 *   get:
 *     summary: Retrieve a single Item Store
 *     tags: [Item Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
itemStoreRouter.get(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "ITEM_STORE", "VIEW")),
  getItemStoreById
);

/**
 * @swagger
 * /api/v1/master/item-store:
 *   put:
 *     summary: Update a Item Store's details
 *     tags: [Item Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemStoreId
 *         required: true
 *         schema:
 *           type: string
 *         description: The itemStore ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemStoreUpdateSchema'
 */
itemStoreRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "ITEM_STORE", "VIEW"),
    getPermission("INV", "ITEM_STORE", "UPDATE")
  ),
  validateItemStoreUpdate,
  updateItemStore
);
