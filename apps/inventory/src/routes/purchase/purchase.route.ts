import {
  createPurchase,
  getAllPurchase,
  getPurchaseById,
  updatePurchase,
} from "@/controllers/purchase/purchase.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validatePurchase,
  validatePurchaseUpdate,
} from "@/validations/request/purchase/purchase.validation.js";

import { Router } from "express";

export const purchaseRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Purchase Order
 *   description: Purchase Order management endpoints
 */

/**
 * @swagger
 * /api/v1/purchase/purchase-order:
 *   post:
 *     summary: Create a new Purchase Order
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/purchaseSchema'
 */
purchaseRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INV", "PURCHASE_ORDER", "CREATE")),
  validatePurchase,
  createPurchase,
);

/**
 * @swagger
 * /api/v1/purchase/purchase-order:
 *   get:
 *     summary: Retrieve a list of Purchase Order
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 */
purchaseRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("INV", "PURCHASE_ORDER", "VIEW")),
  getAllPurchase,
);

/**
 * @swagger
 * /api/v1/purchase/purchase-order/id:
 *   get:
 *     summary: Retrieve a single Purchase Order
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
purchaseRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("INV", "PURCHASE_ORDER", "VIEW")),
  getPurchaseById,
);

/**
 * @swagger
 * /api/v1/purchase/purchase-order:
 *   put:
 *     summary: Update a Purchase Order's details
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The purchase ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/purchaseSchemaUpdate'
 */
purchaseRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("INV", "PURCHASE_ORDER", "VIEW"),
    getPermission("INV", "PURCHASE_ORDER", "UPDATE"),
  ),
  validatePurchaseUpdate,
  updatePurchase,
);

/**
 * @swagger
 * /api/v1/purchase/purchase-order/{purchaseId=id}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Purchase Order]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code of the resource.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource to delete.
 */
// purchaseRouter.delete("/", verifyToken, authorize(getPermission("PURCHASE_ORDER", "DELETE")), deletePurchase);

/**
 * @swagger
 * /api/v1/purchase/purchase-order/:{id}/approval:
 *   post:
 *     summary: Approve a Purchase Order
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/purchaseSchema'
 */
// purchaseRouter.post(
//   "/:id/approval",
//   verifyToken,
//   authorize(getPermission("PURCHASE_APPROVAL", "CREATE")),
//   purchaseApproval
// );

/**
 * @swagger
 * /api/v1/purchase/purchase-order/purchase-excel:
 *   post:
 *     summary: Create a new Purchase Order
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/purchaseSchema'
 */
// purchaseRouter.post(
//   "/purchase-excel",
//   verifyToken,
//   authorize(getPermission("PURCHASE_EXCEL", "VIEW")),
//   validateExcelFilterPurchase,
//   // excelPurchaseOrderReport
// );

/**
 * @swagger
 * /api/v1/purchase/purchase-order/pdf:
 *   post:
 *     summary: Print Purchase Order
 *     tags: [Purchase Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The purchase ID.
 */
// purchaseRouter.post("/pdf", verifyToken, authorize(getPermission("PURCHASE_ORDER_PDF", "VIEW")), printPOById);
