import {
  acknowledgeStoreRequisition,
  createStoreRequisition,
  deleteStoreRequisition,
  getAllStoreRequisition,
  getstoreRequisitionById,
  rejectStoreRequisition,
  approveStoreRequisition,
  updateStoreRequisition,
  getstoreRequisitionBatchWiseById,
  excelStoreReqReport,
  storeRequisitionPdfById,
  getAllStoreRequisitionBatchWiseById,
} from "@/controllers/purchase/storeRequisition.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateAcknowledgeStoreRequisition,
  validateExcelFilterStoreRequisition,
  validateSentStoreRequisition,
  validateStoreRequisition,
  validateStoreRequisitionReject,
  validateStoreRequisitionUpdate,
} from "@/validations/request/purchase/storeRequisition.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const storeRequisitionRouter: Router = Router();

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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION", "CREATE")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION", "VIEW")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION", "VIEW")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "STORE_REQUISITION", "VIEW"),
    getPermission("PMS", "STORE_REQUISITION", "UPDATE")
  ),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION", "DELETE")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION_REJECT", "CREATE")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION_SENT", "CREATE")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION_ACK", "CREATE")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION", "VIEW")),
  getstoreRequisitionBatchWiseById
);

/**
 * @swagger
 * /api/v1/storeRequisition/batch-wise:
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
  "/batch-wise",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION", "VIEW")),
  getAllStoreRequisitionBatchWiseById
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
storeRequisitionRouter.post(
  "/excel-report",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION_EXCEL", "VIEW")),
  validateExcelFilterStoreRequisition,
  excelStoreReqReport
);

/**
 * @swagger
 * /api/v1/storeRequisition/pdf:
 *   get:
 *    summary: Get store requisition receipt by store requisition ID
 *    tags: [Store Requisition]
 *    security:
 *     - bearerAuth: []
 *   parameters:
 *     - in: query
 *       name: storeRequisitionId
 *       required: true
 *       schema:
 *         type: string
 *       description: The store requisition ID.
 */
storeRequisitionRouter.get(
  "/pdf",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "STORE_REQUISITION_PDF", "VIEW")),
  storeRequisitionPdfById
);
