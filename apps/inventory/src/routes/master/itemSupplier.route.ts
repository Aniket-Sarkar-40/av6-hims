import {
  createItemSupplier,
  deleteItemSupplierById,
  getAllItemSupplier,
  getItemSupplierById,
  updateItemSupplier,
} from "@/controllers/master/itemSupplier.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import {
  validateCreateItemSupplier,
  validateUpdateItemSupplier,
} from "@/validations/request/master/itemSupplier.validation";

import { Router } from "express";

export const itemSupplierRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Item Supplier
 *   description: Item Supplier management endpoints
 */

/**
 * @swagger
 * /api/v1/master/item-supplier:
 *   post:
 *     summary: Create a new Item Supplier
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemSupplierCreateSchema'
 */
itemSupplierRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ITEM_SUPPLIER", "CREATE")),
  validateCreateItemSupplier,
  createItemSupplier
);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   put:
 *     summary: Update a Item Supplier's details
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/itemSupplierUpdateSchema'
 */
itemSupplierRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("ITEM_SUPPLIER", "UPDATE")),
  validateUpdateItemSupplier,
  updateItemSupplier
);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   get:
 *     summary: Retrieve all Item Supplier
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 */
itemSupplierRouter.get("/", verifyToken, authorize(getPermission("ITEM_SUPPLIER", "VIEW")), getAllItemSupplier);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   get:
 *     summary: Retrieve single Item Supplier
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemSupplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Item Supplier ID.
 */

itemSupplierRouter.get("/id", verifyToken, authorize(getPermission("ITEM_SUPPLIER", "VIEW")), getItemSupplierById);

/**
 * @swagger
 *  /api/v1/master/item-supplier:
 *   get:
 *     summary: Delete Item Supplier by ID
 *     tags: [Item Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemSupplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Item Supplier ID.
 */

itemSupplierRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("ITEM_SUPPLIER", "DELETE")),
  deleteItemSupplierById
);
