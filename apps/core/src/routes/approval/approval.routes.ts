import {
  commonApproval,
  getApprovalActDetails,
  getStaffPendingApproval,
  startApprovalFlow,
} from "@/controllers/approval/approval.controller.js";
import { authorizeExternal } from "@/middleware/auth.middleware.js";
import {
  validateCommonApprove,
  validateGetMyApprovalFlow,
  validateStartFlowRequest,
} from "@/validations/request/approval/approval.validation.js";
import { verifyToken } from "@repo/platform/middlewares/auth.middleware.js";
import { Router } from "express";

export const approvalRouter: Router = Router();

/**
 * @swagger
 * /api/v1/common/approval:
 *   patch:
 *     summary: Approve or reject a resource
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonUpdateStatusSchema'
 */
approvalRouter.patch("/", verifyToken, validateCommonApprove, commonApproval);
approvalRouter.patch(
  "/ext",
  authorizeExternal(),
  validateCommonApprove,
  commonApproval
);

/**
 * @swagger
 * /api/v1/common/approval:
 *   patch:
 *     summary: Approve or reject a resource
 *     tags: [Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/commonUpdateStatusSchema'
 */
approvalRouter.post(
  "/",
  verifyToken,
  validateGetMyApprovalFlow,
  getStaffPendingApproval
);
approvalRouter.post(
  "/ext",
  authorizeExternal(),
  validateGetMyApprovalFlow,
  getStaffPendingApproval
);

/**
 * @swagger
 * /api/v1/common/getApprovalActions:
 */
approvalRouter.post("/getApprovalActions", verifyToken, getApprovalActDetails);
approvalRouter.post(
  "/getApprovalActions-ext",
  authorizeExternal(),
  getApprovalActDetails
);

approvalRouter.post(
  "/start-flow-ext",
  authorizeExternal(),
  validateStartFlowRequest,
  startApprovalFlow
);
