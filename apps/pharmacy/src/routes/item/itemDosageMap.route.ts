import {
  createItemDosageMap,
  deleteItemDosage,
  updateItemDosageMap,
} from "@/controllers/item/itemDosageMap.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreateItemDosageMap,
  validateUpdateItemDosageMap,
} from "@/validations/request/item/item.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const itemDosageRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Item dosage map
 *   description: Item Dosage endpoints
 */

/**
 * @swagger
 * /api/v1/item-dosage:
 *   post:
 *     summary: Create a new Item dosage map
 *     tags: [Item dosage map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createItemDosageMapSchema'
 */
itemDosageRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "ITEM_DOSAGE_MAP", "CREATE")),
  validateCreateItemDosageMap,
  createItemDosageMap
);

/**
 * @swagger
 * /api/v1/item-dosage:
 *   put:
 *     summary: Update a new Item dosage map
 *     tags: [Item dosage map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updateItemDosageMapSchema'
 */
itemDosageRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "ITEM_DOSAGE_MAP", "VIEW"),
    getPermission("PMS", "ITEM_DOSAGE_MAP", "UPDATE")
  ),
  validateUpdateItemDosageMap,
  updateItemDosageMap
);

/**
 * @swagger
 * /api/v1/item-dosage/{id}:
 *   delete:
 *     summary: Delete a single Item dosage map
 *     tags: [Item dosage map]
 *     security:
 *       - bearerAuth: []
 */
itemDosageRouter.delete(
  "/:id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "ITEM_DOSAGE_MAP", "DELETE")),
  deleteItemDosage
);
