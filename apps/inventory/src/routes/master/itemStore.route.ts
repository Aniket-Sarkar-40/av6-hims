import {
  createItemStore,
  getAllItemStore,
  getItemStoreById,
  updateItemStore,
} from "@/controllers/master/itemStore.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { validateItemStoreCreate, validateItemStoreUpdate } from "@/validations/request/master/itemStore.validation";
import { Router } from "express";

export const itemStoreRouter = Router();

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
  verifyToken,
  authorize(getPermission("ITEM_STORE", "CREATE")),
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
itemStoreRouter.get("/", verifyToken, authorize(getPermission("ITEM_STORE", "VIEW")), getAllItemStore);

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
itemStoreRouter.get("/id", verifyToken, authorize(getPermission("ITEM_STORE", "VIEW")), getItemStoreById);

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
  verifyToken,
  authorize(getPermission("ITEM_STORE", "VIEW"), getPermission("ITEM_STORE", "UPDATE")),
  validateItemStoreUpdate,
  updateItemStore
);
