import {
  createWarehouse,
  getAllWarehouse,
  getWarehouseById,
  toggleActiveWarehouse,
  updateWarehouse,
} from "@/controllers/master/warehouse.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateToggleActive } from "@/validations/request/common.validation.js";
import { validateWarehouse } from "@/validations/request/master/warehouse.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const warehouseRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Warehouse
 *   description: Warehouse management endpoints
 */

/**
 * @swagger
 * /api/v1/master/warehouse:
 *   post:
 *     summary: Create a new Warehouse
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/warehouseSchema'
 */
warehouseRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "WAREHOUSE", "CREATE")),
  validateWarehouse,
  createWarehouse
);

/**
 * @swagger
 * /api/v1/master/warehouse:
 *   get:
 *     summary: Retrieve a list of Warehouse
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 */
warehouseRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "WAREHOUSE", "VIEW")),
  getAllWarehouse
);

/**
 * @swagger
 * /api/v1/master/warehouse/id:
 *   get:
 *     summary: Retrieve a single Warehouse
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
warehouseRouter.get(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "WAREHOUSE", "VIEW")),
  getWarehouseById
);

/**
 * @swagger
 * /api/v1/master/warehouse:
 *   put:
 *     summary: Update a Warehouse's details
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The warehouse ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/warehouseSchemaUpdate'
 */
warehouseRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "WAREHOUSE", "VIEW"),
    getPermission("INV", "WAREHOUSE", "UPDATE")
  ),
  validateWarehouse,
  updateWarehouse
);

/**
 * @swagger
 * /api/v1/master/warehouse/toggle-active:
 *   post:
 *     summary: active or Re-active a single Warehouse
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/toggleActiveSchema'
 */
warehouseRouter.post(
  "/toggle-active",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "WAREHOUSE", "VIEW"),
    getPermission("INV", "WAREHOUSE", "UPDATE")
  ),
  validateToggleActive,
  toggleActiveWarehouse
);

export default warehouseRouter;
