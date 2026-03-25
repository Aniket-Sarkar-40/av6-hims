import { Router } from "express";
import { verifyToken, authorize } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import {
  validateItemCategoryCreate,
  validateItemCategoryUpdate,
} from "@/validations/request/master/itemCategory.validation";
import {
  createItemCategory,
  getAllItemCategory,
  getItemCategoryById,
  updateItemCategory,
} from "@/controllers/master/itemCategory.controller";

export const itemCategoryRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Item Category
 *   description: Item Category management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-category:
 *   post:
 *     summary: Create a new Item Category
 *     tags: [Item Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemCategorySchema'
 */
itemCategoryRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ITEM_CATEGORY", "CREATE")),
  validateItemCategoryCreate,
  createItemCategory
);

/**
 * @swagger
 * /api/v1/master/item-category:
 *   get:
 *     summary: Retrieve a list of Item Category
 *     tags: [Item Category]
 *     security:
 *       - bearerAuth: []
 */
itemCategoryRouter.get("/", verifyToken, authorize(getPermission("ITEM_CATEGORY", "VIEW")), getAllItemCategory);

/**
 * @swagger
 * /api/v1/master/item-category/id:
 *   get:
 *     summary: Retrieve a single Item Category
 *     tags: [Item Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
itemCategoryRouter.get("/id", verifyToken, authorize(getPermission("ITEM_CATEGORY", "VIEW")), getItemCategoryById);

/**
 * @swagger
 * /api/v1/master/item-category:
 *   put:
 *     summary: Update a Item Category's details
 *     tags: [Item Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The itemCategory ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/itemCategorySchemaUpdate'
 */
itemCategoryRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("ITEM_CATEGORY", "VIEW"), getPermission("ITEM_CATEGORY", "UPDATE")),
  validateItemCategoryUpdate,
  updateItemCategory
);
