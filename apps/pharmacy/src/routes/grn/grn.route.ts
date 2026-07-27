import {
  createGrn,
  deleteGrn,
  excelGrnReport,
  getAllGrn,
  getGrnById,
  printGrnById,
  updateGrn,
} from "@/controllers/grn/grn.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateExcelFilterGrn,
  validateGrn,
  validateGrnUpdate,
} from "@/validations/request/grn/grn.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const grnRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Good Receive Note
 *   description: Good Receive Note management endpoints
 */

/**
 * @swagger
 * /api/v1/grn:
 *   post:
 *     summary: Create a new Good Receive Note
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnSchema'
 */
grnRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN", "CREATE")),
  validateGrn,
  createGrn,
);

/**
 * @swagger
 * /api/v1/grn:
 *   get:
 *     summary: Retrieve a list of Good Receive Note
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 */
grnRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN", "VIEW")),
  getAllGrn,
);

/**
 * @swagger
 * /api/v1/grn/id:
 *   get:
 *     summary: Retrieve a single Good Receive Note
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
grnRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN", "VIEW")),
  getGrnById,
);

/**
 * @swagger
 * /api/v1/grn:
 *   put:
 *     summary: Update a Good Receive Note's details
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: grnId
 *         required: true
 *         schema:
 *           type: string
 *         description: The grn ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnSchemaUpdate'
 */
grnRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "GRN", "VIEW"),
    getPermission("PMS", "GRN", "UPDATE"),
  ),
  validateGrnUpdate,
  updateGrn,
);

/**
 * @swagger
 * /api/v1/grn/{grnId=id}:
 *   delete:
 *     summary: Delete a resource by short code and ID
 *     tags: [Good Receive Note]
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
grnRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN", "DELETE")),
  deleteGrn,
);

/**
 * @swagger
 * /api/v1/grn/excel-report:
 *   post:
 *     summary: Create a new Good Receive Note
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/grnSchema'
 */
grnRouter.post(
  "/excel-report",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_EXCEL", "VIEW")),
  validateExcelFilterGrn,
  excelGrnReport,
);

/**
 * @swagger
 * /api/v1/grn/pdf:
 *   post:
 *     summary: Print Good Receive Note
 *     tags: [Good Receive Note]
 *     security:
 *       - bearerAuth: []
 */
grnRouter.post(
  "/pdf",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN_PDF", "VIEW")),
  printGrnById,
);

grnRouter.delete(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "GRN", "DELETE")),
  deleteGrn,
);
