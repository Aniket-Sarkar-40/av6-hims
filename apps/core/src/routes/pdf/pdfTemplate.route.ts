import {
  buildPdf,
  createPdfTemplate,
  deletePdfTemplate,
  getContractKeys,
  getPdfTemplateByModuleAndType,
  makeDefaultPdfTemplate,
  updatePdfTemplate,
} from "@/controllers/pdf/pdfTemplate.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { createUploadMiddleware } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCreatePdfTemplate,
  validateGetPdfTemplateByModuleAndType,
  validatemakeDefaultPdfTemplate,
  validateUpdatePdfTemplate,
} from "@/validations/request/pdf/pdfTemplate.validation.js";
import { Router } from "express";
import { uploadToHetzner } from "@repo/platform/middlewares/s3bucket.middleware.js";
import { authorizeExternal } from "@/middleware/auth.middleware.js";

export const pdfTemplateRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: PDF Template
 *   description: PDF Template management endpoints
 */

/**
 * @swagger
 * /api/v1/pdf-template:
 *   post:
 *     summary: Create a new PDF Template
 *     tags: [PDF Template]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/createPdfTemplateSchema'
 */
pdfTemplateRouter.post(
  "/",
  verifyToken(),
  createUploadMiddleware("pdfTemplate"),
  uploadToHetzner("sampleImage"),
  authorize(getPermission("CORE", "PDF_TEMPLATE", "CREATE")),
  validateCreatePdfTemplate,
  createPdfTemplate,
);

/**
 * @swagger
 * /api/v1/pdf-template:
 *   put:
 *     summary: Update a PDF Template
 *     tags: [PDF Template]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updatePdfTemplateSchema'
 */
pdfTemplateRouter.put(
  "/",
  verifyToken,
  createUploadMiddleware("pdfTemplate"),
  uploadToHetzner("sampleImage"),
  authorize(
    getPermission("CORE", "PDF_TEMPLATE", "UPDATE"),
    getPermission("CORE", "PDF_TEMPLATE", "VIEW"),
  ),
  validateUpdatePdfTemplate,
  updatePdfTemplate,
);

/**
 * @swagger
 * /api/v1/pdf-template:
 *   delete:
 *     summary: Delete a PDF Template
 *     tags: [PDF Template]
 *     security:
 *       - bearerAuth: []
 *     peremeters:
 *       - in: query
 *         name: pdfTemplateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The PDF Template ID
 */
pdfTemplateRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "PDF_TEMPLATE", "DELETE")),
  deletePdfTemplate,
);

/**
 * @swagger
 * /api/v1/pdf-template/make-default:
 *   put:
 *     summary: Make a PDF Template default
 *     tags: [PDF Template]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/makeDefaultPdfTemplateSchema'
 */
pdfTemplateRouter.put(
  "/make-default",
  verifyToken(),
  authorize(
    getPermission("CORE", "PDF_TEMPLATE", "UPDATE"),
    getPermission("CORE", "PDF_TEMPLATE", "VIEW"),
  ),
  validatemakeDefaultPdfTemplate,
  makeDefaultPdfTemplate,
);

pdfTemplateRouter.post(
  "/build",
  verifyToken(),
  authorize(getPermission("CORE", "PDF_TEMPLATE", "VIEW")),
  // validatePdfTemplateUpdate,
  buildPdf,
);

pdfTemplateRouter.get(
  "/contract-keys",
  verifyToken(),
  authorize(getPermission("CORE", "PDF_CONTRACT", "VIEW")),
  // validatePdfTemplateUpdate,
  getContractKeys,
);

pdfTemplateRouter.get(
  "/module-and-type",
  verifyToken(),
  authorize(getPermission("CORE", "PDF_TEMPLATE", "VIEW")),
  validateGetPdfTemplateByModuleAndType,
  getPdfTemplateByModuleAndType,
);

pdfTemplateRouter.get(
  "/module-and-type-ext",
  authorizeExternal(),
  validateGetPdfTemplateByModuleAndType,
  getPdfTemplateByModuleAndType,
);
