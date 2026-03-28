import {
  acknowledgeStoreRequisitionReturn,
  approveStoreRequisitionReturn,
  createStoreRequisitionReturn,
  deleteStoreRequisitionReturn,
  getAllStoreRequisitionReturn,
  getStoreRequisitionReturnById,
  rejectStoreRequisitionReturn,
  updateStoreRequisitionReturn,
} from "@/controllers/purchase/storeRequisitionReturn.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateAcknowledgeStoreRequisitionReturn,
  validateApproveStoreRequisitionReturn,
  validateStoreRequisitionReturn,
  validateStoreRequisitionReturnReject,
  validateStoreRequisitionReturnUpdate,
} from "@/validations/request/purchase/storeRequisitionReturn.validation.js";

import { Router } from "express";

export const storeRequisitionReturnRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Store Requisition
 *   description: Store Requisition management endpoints
 */

/**
 * @swagger
 * /api/v1/storeRequisitionReturn:
 *   post:
 *     summary: Create a new Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchema'
 */
storeRequisitionReturnRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN", "CREATE")),
  validateStoreRequisitionReturn,
  createStoreRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn:
 *   get:
 *     summary: Retrieve a list of Store Requisition Returns
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN", "VIEW")),
  getAllStoreRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/id:
 *   get:
 *     summary: Retrieve a single Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
storeRequisitionReturnRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN", "VIEW")),
  getStoreRequisitionReturnById,
);

/**
 * @swagger
 * /api/v1/storeRequisition:
 *   put:
 *     summary: Update a Store Requisition's details
 *     tags: [Store Requisition Return]
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
storeRequisitionReturnRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("PMS", "STORE_REQUISITION_RETURN", "VIEW"),
    getPermission("PMS", "STORE_REQUISITION_RETURN", "UPDATE"),
  ),
  validateStoreRequisitionReturnUpdate,
  updateStoreRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/{id=id}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Store Requisition Return]
 */
storeRequisitionReturnRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN", "DELETE")),
  deleteStoreRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/reject:
 *   post:
 *     summary: Approve a Store Requisition
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchema'
 */
storeRequisitionReturnRouter.post(
  "/reject",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN_REJECT", "CREATE")),
  validateStoreRequisitionReturnReject,
  rejectStoreRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/approve:
 *   post:
 *     summary: Send a Store Requisition
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/storeRequisitionSchema'
 */
storeRequisitionReturnRouter.post(
  "/approve",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN_SENT", "CREATE")),
  validateApproveStoreRequisitionReturn,
  approveStoreRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/acknowledge:
 *   post:
 *     summary: Acknowledge a Store Requisition return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/ackRequisitionSchema'
 */
storeRequisitionReturnRouter.post(
  "/acknowledge",
  verifyToken,
  authorize(getPermission("PMS", "STORE_REQUISITION_RETURN_ACK", "CREATE")),
  validateAcknowledgeStoreRequisitionReturn,
  acknowledgeStoreRequisitionReturn,
);

// /**
//  * @swagger
//  * /api/v1/storeRequisition/batch-wise-by-id:
//  *   get:
//  *     summary: Retrieve a single Store Requisition
//  *     tags: [Store Requisition Return]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       '200':
//  *         description: Type found
//  *       '404':
//  *         description: Type not found
//  */
// storeRequisitionReturnRouter.get(
//   "/batch-wise-by-id",
//   verifyToken,
//   authorize(getPermission("STORE_REQUISITION", "VIEW")),
//   getstoreRequisitionBatchWiseById
// );

// /**
//  * @swagger
//  * /api/v1/storeRequisition/excel-report:
//  *   post:
//  *     summary: Excel creation for Store Requisition
//  *     tags: [Store Requisition Return]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/storeReqExcelFilterSchema'
//  */
// storeRequisitionReturnRouter.post(
//   "/excel-report",
//   verifyToken,
//   authorize(getPermission("STORE_REQUISITION_EXCEL", "VIEW")),
//   validateExcelFilterStoreRequisition,
//   excelStoreReqReport
// );
