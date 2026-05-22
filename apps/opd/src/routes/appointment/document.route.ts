import { createDocument } from "@/controllers/appointment/document.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { validateDocumentCreate } from "@/validations/request/appointment/document.validation.js";
import { Router } from "express";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const documentRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Document
 *   description: Patient document management endpoints
 */

/**
 * @swagger
 * /api/v1/appointment-details/document:
 *   post:
 *     summary: Create a new document
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/documentSchema'
 */
documentRouter.post(
  "/",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "DOCUMENT", "CREATE")),
  createUploadMiddleware("filePath"),
  uploadToHetzner("Document"),
  validateDocumentCreate,
  createDocument
);
