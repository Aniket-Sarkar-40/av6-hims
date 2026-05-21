import {
  approveGrnReturn,
  createGrnReturn,
  deleteGrnReturn,
  excelGrnReturnReport,
  getAllGrnReturn,
  getGrnReturnById,
  printGrnReturnById,
  rejectedGrnReturn,
  updateGrnReturn,
} from "@/controllers/grn/grnReturn.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateGrnReturn,
  validateGrnReturnApprove,
  validateGrnReturnExcel,
  validateGrnReturnUpdate,
} from "@/validations/request/grn/grnReturn.validation.js";

import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const grnReturnRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Good Receive Note Return
 *   description: Good Receive Note Return management endpoints
 */

/**
 * @swagger
 * /api/v1/grnReturn:
 *   post:
 *     summary: Create a new Good Receive Note Return
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnReturnSchema'
 */
grnReturnRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN", "CREATE")),
  validateGrnReturn,
  createGrnReturn
);

/**
 * @swagger
 * /api/v1/grnReturn:
 *   get:
 *     summary: Retrieve a list of Good Receive Note Return
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 */
grnReturnRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN", "VIEW")),
  getAllGrnReturn
);

/**
 * @swagger
 * /api/v1/grnReturn/id:
 *   get:
 *     summary: Retrieve a single Good Receive Note Return
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
grnReturnRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN", "VIEW")),
  getGrnReturnById
);

/**
 * @swagger
 * /api/v1/grnReturn:
 *   put:
 *     summary: Update a Good Receive Note Return's details
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grnReturnId
 *         required: true
 *         schema:
 *           type: string
 *         description: The grnReturn ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnReturnSchemaUpdate'
 */
grnReturnRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "GRN_RETURN", "VIEW"),
    getPermission("PMS", "GRN_RETURN", "UPDATE")
  ),
  validateGrnReturnUpdate,
  updateGrnReturn
);

/**
 * @swagger
 * /api/v1/grnReturn/{grnReturnId=id}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Good Receive Note Return]
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
grnReturnRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN", "DELETE")),
  deleteGrnReturn
);

/**
 * @swagger
 * /api/v1/grnReturn:
 *   post:
 *     summary: Create a new Good Receive Note Return
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnReturnSchema'
 */
grnReturnRouter.post(
  "/approve",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN_APPROVE", "CREATE")),
  validateGrnReturnApprove,
  approveGrnReturn
);

/**
 * @swagger
 * /api/v1/grnReturn:
 *   post:
 *     summary: Create a new Good Receive Note Return
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnReturnSchema'
 */
grnReturnRouter.post(
  "/rejected",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN_REJECTED", "CREATE")),
  rejectedGrnReturn
);

/**
 * @swagger
 * /api/v1/grnReturn/excel-report:
 *   post:
 *     summary: Create a new Good Receive Note
 *     tags: [Good Receive Note Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnReturnExcelSchema'
 */
grnReturnRouter.post(
  "/excel-report",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN_EXCEL", "VIEW")),
  validateGrnReturnExcel,
  excelGrnReturnReport
);

/**
 * @swagger
 * /api/v1/grnReturn/pdf:
 *   post:
 *     summary: Print Good Receive Note
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 */
grnReturnRouter.post(
  "/pdf",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_RETURN_PDF", "VIEW")),
  printGrnReturnById
);
