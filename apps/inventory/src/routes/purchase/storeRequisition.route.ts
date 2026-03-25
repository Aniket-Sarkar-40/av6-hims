import {
  acknowledgeStoreRequisition,
  approveStoreRequisition,
  createStoreRequisition,
  deleteStoreRequisition,
  getAllStoreRequisition,
  getstoreRequisitionBatchWiseById,
  getstoreRequisitionById,
  rejectStoreRequisition,
  updateStoreRequisition,
} from "@/controllers/purchase/storeRequisition.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import {
  validateAcknowledgeStoreRequisition,
  validateSentStoreRequisition,
  validateStoreRequisition,
  validateStoreRequisitionReject,
  validateStoreRequisitionUpdate,
} from "@/validations/request/purchase/storeRequisition.validation";
import { Router } from "express";

export const storeRequisitionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Store Requisition
 *   description: Store Requisition management endpoints
 */

/**
 * @swagger
 * /api/v1/storeRequisition:
 *   post:
 *     summary: Create a new Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchema'
 */
storeRequisitionRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION", "CREATE")),
  validateStoreRequisition,
  createStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition:
 *   get:
 *     summary: Retrieve a list of Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION", "VIEW")),
  getAllStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition/id:
 *   get:
 *     summary: Retrieve a single Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
storeRequisitionRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION", "VIEW")),
  getstoreRequisitionById
);

/**
 * @swagger
 * /api/v1/storeRequisition:
 *   put:
 *     summary: Update a Store Requisition's details
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeRequisitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The storeRequisition ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchemaUpdate'
 */
storeRequisitionRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION", "VIEW"), getPermission("STORE_REQUISITION", "UPDATE")),
  validateStoreRequisitionUpdate,
  updateStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition/{storeRequisitionId=id}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Store Requisition]
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
storeRequisitionRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION", "DELETE")),
  deleteStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition/reject:
 *   post:
 *     summary: Approve a Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchema'
 */
storeRequisitionRouter.post(
  "/reject",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION_REJECT", "CREATE")),
  validateStoreRequisitionReject,
  rejectStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition/approve:
 *   post:
 *     summary: Send a Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchema'
 */
storeRequisitionRouter.post(
  "/approve",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION_SENT", "CREATE")),
  validateSentStoreRequisition,
  approveStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition/acknowledge:
 *   post:
 *     summary: Approve a Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/ackRequisitionSchema'
 */
storeRequisitionRouter.post(
  "/acknowledge",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION_ACK", "CREATE")),
  validateAcknowledgeStoreRequisition,
  acknowledgeStoreRequisition
);

/**
 * @swagger
 * /api/v1/storeRequisition/batch-wise-by-id:
 *   get:
 *     summary: Retrieve a single Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
storeRequisitionRouter.get(
  "/batch-wise-by-id",
  verifyToken,
  authorize(getPermission("STORE_REQUISITION", "VIEW")),
  getstoreRequisitionBatchWiseById
);

/**
 * @swagger
 * /api/v1/storeRequisition/excel-report:
 *   post:
 *     summary: Excel creation for Store Requisition
 *     tags: [Store Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeReqExcelFilterSchema'
 */
// storeRequisitionRouter.post(
//   "/excel-report",
//   verifyToken,
//   authorize(getPermission("STORE_REQUISITION_EXCEL", "VIEW")),
//   validateExcelFilterStoreRequisition,
//   excelStoreReqReport
// );
