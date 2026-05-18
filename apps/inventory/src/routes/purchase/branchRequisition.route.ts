import {
  acknowledgeBranchRequisition,
  approveBranchRequisition,
  createBranchRequisition,
  deleteBranchRequisition,
  getAllBranchRequisitionBatchWiseById,
  getBranchRequisitionBatchWiseById,
  rejectBranchRequisition,
  updateBranchRequisition,
} from "@/controllers/purchase/branchRequisition.controller.js";
import {
  validateAcknowledgeBranchRequisition,
  validateApproveBranchRequisition,
  validateBranchRequisition,
  validateBranchRequisitionReject,
  validateBranchRequisitionUpdate,
} from "@/validations/request/purchase/branchRequisition.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const branchRequisitionRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Branch Requisition
 *   description: Branch Requisition management endpoints
 */

/**
 * @swagger
 * /api/v1/branchRequisition:
 *   post:
 *     summary: Create a new Branch Requisition
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchRequisitionSchema'
 */
branchRequisitionRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION", "CREATE")),
  validateBranchRequisition,
  createBranchRequisition
);

/**
 * @swagger
 * /api/v1/branchRequisition:
 *   put:
 *     summary: Update a Branch Requisition's details
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchRequisitionSchemaUpdate'
 */
branchRequisitionRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("INV", "BRANCH_REQUISITION", "VIEW"),
    getPermission("INV", "BRANCH_REQUISITION", "UPDATE")
  ),
  validateBranchRequisitionUpdate,
  updateBranchRequisition
);

/**
 * @swagger
 * /api/v1/branchRequisition:
 *   delete:
 *     summary: Delete a Branch Requisition
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchRequisitionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Branch Requisition ID.
 */
branchRequisitionRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION", "DELETE")),
  deleteBranchRequisition
);

/**
 * @swagger
 * /api/v1/branchRequisition/reject:
 *   post:
 *     summary: Reject a Branch Requisition
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/rejectBranchRequisitionSchema'
 */
branchRequisitionRouter.post(
  "/reject",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION_REJECT", "CREATE")),
  validateBranchRequisitionReject,
  rejectBranchRequisition
);

/**
 * @swagger
 * /api/v1/branchRequisition/approve:
 *   post:
 *     summary: Approve a Branch Requisition
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/approveBranchReqSchema'
 */
branchRequisitionRouter.post(
  "/approve",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION_APPROVE", "CREATE")),
  validateApproveBranchRequisition,
  approveBranchRequisition
);

/**
 * @swagger
 * /api/v1/branchRequisition/acknowledge:
 *   post:
 *     summary: Acknowledge a Branch Requisition
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/acknowledgeBranchRequisitionSchema'
 */
branchRequisitionRouter.post(
  "/acknowledge",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION_ACK", "CREATE")),
  validateAcknowledgeBranchRequisition,
  acknowledgeBranchRequisition
);

/**
 * @swagger
 * /api/v1/branchRequisition/batch-wise-by-id:
 *   get:
 *     summary: Retrieve a single Branch Requisition
 *     tags: [Branch Requisition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
branchRequisitionRouter.get(
  "/batch-wise-by-id",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION", "VIEW")),
  getBranchRequisitionBatchWiseById
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
branchRequisitionRouter.get(
  "/batch-wise",
  verifyToken,
  authorize(getPermission("INV", "BRANCH_REQUISITION", "VIEW")),
  getAllBranchRequisitionBatchWiseById
);
