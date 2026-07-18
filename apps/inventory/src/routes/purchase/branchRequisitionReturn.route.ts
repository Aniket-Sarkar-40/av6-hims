import {
  acknowledgeBranchRequisitionReturn,
  approveBranchRequisitionReturn,
  createBranchRequisitionReturn,
  deleteBranchRequisitionReturn,
  getAllBranchRequisitionReturn,
  getBranchRequisitionReturnById,
  rejectBranchRequisitionReturn,
  updateBranchRequisitionReturn,
} from "@/controllers/purchase/branchRequisitionReturn.controller.js";
import {
  validateAcknowledgeBranchRequisitionReturn,
  validateApproveBranchRequisitionReturn,
  validateBranchRequisitionReturn,
  validateBranchRequisitionReturnReject,
  validateBranchRequisitionReturnUpdate,
} from "@/validations/request/purchase/branchRequisitionReturn.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const branchRequisitionReturnRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Branch Requisition Return
 *   description: Branch Requisition Return management endpoints
 */

/**
 * @swagger
 * /api/v1/branch-requisition-return:
 *   post:
 *     summary: Create a new Branch Requisition Return
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
branchRequisitionReturnRouter.post(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "BRANCH_REQUISITION_RETURN", "CREATE")),
  validateBranchRequisitionReturn,
  createBranchRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return:
 *   get:
 *     summary: Retrieve a list of Branch Requisition Returns
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
branchRequisitionReturnRouter.get(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "BRANCH_REQUISITION_RETURN", "VIEW")),
  getAllBranchRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return/id:
 *   get:
 *     summary: Retrieve a single Branch Requisition Return
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchRequisitionReturnId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Branch Requisition Return ID.
 */
branchRequisitionReturnRouter.get(
  "/id",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "BRANCH_REQUISITION_RETURN", "VIEW")),
  getBranchRequisitionReturnById,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return:
 *   put:
 *     summary: Update a Branch Requisition Return
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
branchRequisitionReturnRouter.put(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "BRANCH_REQUISITION_RETURN", "VIEW"),
    getPermission("INV", "BRANCH_REQUISITION_RETURN", "UPDATE"),
  ),
  validateBranchRequisitionReturnUpdate,
  updateBranchRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return:
 *   delete:
 *     summary: Delete a Branch Requisition Return by branchRequisitionReturnId query
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchRequisitionReturnId
 *         required: true
 *         schema:
 *           type: integer
 */
branchRequisitionReturnRouter.delete(
  "/",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "BRANCH_REQUISITION_RETURN", "DELETE")),
  deleteBranchRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return/reject:
 *   post:
 *     summary: Reject a Branch Requisition Return
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
branchRequisitionReturnRouter.post(
  "/reject",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "BRANCH_REQUISITION_RETURN_REJECT", "CREATE")),
  validateBranchRequisitionReturnReject,
  rejectBranchRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return/approve:
 *   post:
 *     summary: Approve a Branch Requisition Return
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
branchRequisitionReturnRouter.post(
  "/approve",
  verifyToken(ServiceCode.INVENTORY),
  authorize(
    getPermission("INV", "BRANCH_REQUISITION_RETURN_APPROVE", "CREATE"),
  ),
  validateApproveBranchRequisitionReturn,
  approveBranchRequisitionReturn,
);

/**
 * @swagger
 * /api/v1/branch-requisition-return/acknowledge:
 *   post:
 *     summary: Acknowledge a Branch Requisition Return
 *     tags: [Branch Requisition Return]
 *     security:
 *       - bearerAuth: []
 */
branchRequisitionReturnRouter.post(
  "/acknowledge",
  verifyToken(ServiceCode.INVENTORY),
  authorize(getPermission("INV", "BRANCH_REQUISITION_RETURN_ACK", "CREATE")),
  validateAcknowledgeBranchRequisitionReturn,
  acknowledgeBranchRequisitionReturn,
);
