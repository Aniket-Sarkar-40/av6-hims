import {
  createCountryCode,
  deleteCountryCodeById,
  getAllCountryCode,
  getCountryCodeById,
  updateCountryCode,
} from "@/controllers/master/countryCode.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";

import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateCountryCodeCreate,
  validateCountryCodeUpdate,
} from "@/validations/request/master/countryCode.validation.js";
import { Router } from "express";

const countryCodeRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Country Code
 *   description: Country Code management endpoints
 */

/**
 * @swagger
 * /api/v1/country-code:
 *   post:
 *     summary: Create a new country code
 *     tags: [Country Code]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/countryCodeCreateSchema'
 */
countryCodeRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "COUNTRY_CODE", "CREATE")),
  validateCountryCodeCreate,
  createCountryCode
);

/**
 * @swagger
 * /api/v1/country-code:
 *   put:
 *     summary: Update a country code
 *     tags: [Country Code]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/countryCodeUpdateSchema'
 */
countryCodeRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("CORE", "COUNTRY_CODE", "VIEW"),
    getPermission("CORE", "COUNTRY_CODE", "UPDATE")
  ),
  validateCountryCodeUpdate,
  updateCountryCode
);

/**
 * @swagger
 * /api/v1/country-code:
 *   get:
 *     summary: Retrieve all country codes
 *     tags: [Country Code]
 *     security:
 *       - bearerAuth: []
 */
countryCodeRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "COUNTRY_CODE", "VIEW")),
  getAllCountryCode
);

/**
 * @swagger
 * /api/v1/country-code/id/{countryCodeId}:
 *   get:
 *     summary: Retrieve a single country code by ID.
 *     tags: [Country Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: countryCodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the country code to retrieve.
 */
countryCodeRouter.get(
  "/id",
  verifyToken,
  authorize(getPermission("CORE", "COUNTRY_CODE", "VIEW")),
  getCountryCodeById
);

/**
 * @swagger
 * /api/v1/country-code/{countryCodeId}:
 *   delete:
 *     summary: Delete a country code by ID
 *     tags: [Country Code]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: countryCodeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the country code to delete.
 */
countryCodeRouter.delete(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "COUNTRY_CODE", "DELETE")),
  deleteCountryCodeById
);

export default countryCodeRouter;
