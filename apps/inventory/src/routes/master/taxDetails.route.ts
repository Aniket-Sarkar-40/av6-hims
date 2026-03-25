import { createTaxDetails, updateTaxDetails } from "@/controllers/master/taxDetails.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { validateTaxDetailsCreate, validateTaxDetailsUpdate } from "@/validations/request/master/taxDetails.validation";
import { Router } from "express";

export const taxDetailsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: TaxDetails
 *   description: Tax details management endpoints
 */

/**
 * @swagger
 * /api/v1/master/tax-details:
 *   post:
 *     summary: Create a new Tax Details
 *     tags: [TaxDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/taxDetailsSchema'
 */
taxDetailsRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("TAX_DETAILS", "CREATE")),
  validateTaxDetailsCreate,
  createTaxDetails
);

/**
 * @swagger
 * /api/v1/master/tax-details:
 *   put:
 *     summary: Update Tax Details
 *     tags: [TaxDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taxDetailsId
 *         required: true
 *         schema:
 *           type: string
 *         description: The tax details ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/taxDetailsSchemaUpdate'
 */
taxDetailsRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("TAX_DETAILS", "VIEW"), getPermission("TAX_DETAILS", "UPDATE")),
  validateTaxDetailsUpdate,
  updateTaxDetails
);
