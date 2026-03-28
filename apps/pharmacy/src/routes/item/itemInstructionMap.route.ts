import {
  createItemInstructionMap,
  deleteItemInstruction,
  updateItemInstructionMap,
} from "@/controllers/item/itemInstructionMap.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateItemInstructionMap,
  validateUpdateItemInstructionMap,
} from "@/validations/request/item/item.validation.js";

import { Router } from "express";

export const itemInstructionRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item instruction map
 *   description: Item Instruction endpoints
 */

/**
 * @swagger
 * /api/v1/item-instruction:
 *   post:
 *     summary: Create a new Item instruction map
 *     tags: [Item instruction map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonItemInstructionSchema'
 */
itemInstructionRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_INST_MAP", "CREATE")),
  validateCreateItemInstructionMap,
  createItemInstructionMap,
);

/**
 * @swagger
 * /api/v1/item-instruction:
 *   put:
 *     summary: Update a new Item instruction map
 *     tags: [Item instruction map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateItemInstructionMapSchema'
 */
itemInstructionRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "ITEM_INST_MAP", "VIEW"),
    getPermission("PMS", "ITEM_INST_MAP", "UPDATE"),
  ),
  validateUpdateItemInstructionMap,
  updateItemInstructionMap,
);

/**
 * @swagger
 * /api/v1/item-instruction/{id}:
 *   delete:
 *     summary: Delete a single Item instruction map
 *     tags: [Item instruction map]
 *     security:
 *       - bearerAuth: []
 */
itemInstructionRouter.delete(
  "/:id",
  verifyToken,
  authorize(getPermission("PMS", "ITEM_INST_MAP", "DELETE")),
  deleteItemInstruction,
);
