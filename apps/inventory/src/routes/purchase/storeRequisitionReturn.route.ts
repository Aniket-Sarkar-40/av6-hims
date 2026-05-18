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
  validateAcknowledgeStoreRequisitionReturn,
  validateApproveStoreRequisitionReturn,
  validateStoreRequisitionReturn,
  validateStoreRequisitionReturnReject,
  validateStoreRequisitionReturnUpdate,
} from "@/validations/request/purchase/storeRequisitionReturn.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const storeRequisitionReturnRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Store Requisition Return
 *   description: Store Requisition Return management endpoints
 */

/**
 * @swagger
 * /api/v1/storeRequisitionReturn:
 *   post:
 *     summary: Create a new Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INV", "STORE_REQUISITION_RETURN", "CREATE")),
  validateStoreRequisitionReturn,
  createStoreRequisitionReturn
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
  authorize(getPermission("INV", "STORE_REQUISITION_RETURN", "VIEW")),
  getAllStoreRequisitionReturn
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/id:
 *   get:
 *     summary: Retrieve a single Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("INV", "STORE_REQUISITION_RETURN", "VIEW")),
  getStoreRequisitionReturnById
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn:
 *   put:
 *     summary: Update a Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("INV", "STORE_REQUISITION_RETURN", "VIEW"),
    getPermission("INV", "STORE_REQUISITION_RETURN", "UPDATE")
  ),
  validateStoreRequisitionReturnUpdate,
  updateStoreRequisitionReturn
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn:
 *   delete:
 *     summary: Delete a Store Requisition Return by storeRequisitionReturnId query
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("INV", "STORE_REQUISITION_RETURN", "DELETE")),
  deleteStoreRequisitionReturn
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/reject:
 *   post:
 *     summary: Reject a Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.post(
  "/reject",
  verifyToken,
  authorize(getPermission("INV", "STORE_REQUISITION_RETURN_REJECT", "CREATE")),
  validateStoreRequisitionReturnReject,
  rejectStoreRequisitionReturn
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/approve:
 *   post:
 *     summary: Approve a Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
storeRequisitionReturnRouter.post(
  "/approve",
  verifyToken,
  authorize(getPermission("INV", "STORE_REQUISITION_RETURN_APPROVE", "CREATE")),
  validateApproveStoreRequisitionReturn,
  approveStoreRequisitionReturn
);

/**
 * @swagger
 * /api/v1/storeRequisitionReturn/acknowledge:
 *   post:
 *     summary: Acknowledge a Store Requisition Return
 *     tags: [Store Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
// TODO: Permission code `STORE_REQUISITION_RETURN_ACK` does not exist yet;
// using the existing `STORE_REQUISITION_RETURN_ACKNOWLEDGE` to stay consistent with permissions.utils.ts.
storeRequisitionReturnRouter.post(
  "/acknowledge",
  verifyToken,
  authorize(
    getPermission("INV", "STORE_REQUISITION_RETURN_ACKNOWLEDGE", "CREATE")
  ),
  validateAcknowledgeStoreRequisitionReturn,
  acknowledgeStoreRequisitionReturn
);
