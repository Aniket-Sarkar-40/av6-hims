import { Router } from "express";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  validateCountry,
  validateCountryUpdate,
} from "@/validations/request/master/country.validation.js";
import {
  createCountry,
  deleteCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
} from "@/controllers/master/country.controller.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

const countryRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Country
 *   description: Country management endpoints
 */

/**
 * @swagger
 * /api/v1/country:
 *   post:
 *     summary: Create a new country
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/countrySchema'
 */
countryRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "COUNTRY", "CREATE")),
  validateCountry,
  createCountry,
);

/**
 * @swagger
 * /api/v1/country:
 *   get:
 *     summary: Retrieve a list of countries
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 */
countryRouter.get(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "COUNTRY", "VIEW")),
  getAllCountries,
);

/**
 * @swagger
 * /api/v1/country/{countryId}:
 *   get:
 *     summary: Retrieve a single country by ID
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The country ID.
 */
countryRouter.get(
  "/id",
  verifyToken(),
  authorize(getPermission("CORE", "COUNTRY", "VIEW")),
  getCountryById,
);

/**
 * @swagger
 * /api/v1/country/{countryId}:
 *   put:
 *     summary: Update a country's details
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/countrySchema'
 */
countryRouter.put(
  "/",
  verifyToken(),
  authorize(
    getPermission("CORE", "COUNTRY", "VIEW"),
    getPermission("CORE", "COUNTRY", "UPDATE"),
  ),
  validateCountryUpdate,
  updateCountry,
);

/**
 * @swagger
 * /api/v1/country/{countryId}:
 *   delete:
 *     summary: Delete a country
 *     tags: [Country]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The country ID to delete.
 */
countryRouter.delete(
  "/:countryId",
  verifyToken(),
  authorize(getPermission("CORE", "COUNTRY", "DELETE")),
  deleteCountry,
);

export default countryRouter;
