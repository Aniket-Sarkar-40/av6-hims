import { Router } from "express";

import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  createCity,
  deleteCity,
  getAllCities,
  getCityById,
  updateCity,
} from "@/controllers/master/city.controller.js";
import {
  validateCity,
  validateCityUpdate,
} from "@/validations/request/master/city.validation.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

const cityRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: City
 *   description: City management endpoints
 */

/**
 * @swagger
 * /api/v1/city:
 *   post:
 *     summary: Create a new city
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/citySchema'
 */
cityRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "CITY", "CREATE")),
  validateCity,
  createCity
);

/**
 * @swagger
 * /api/v1/city:
 *   get:
 *     summary: Retrieve a list of cities
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 */
cityRouter.get(
  "/",
  verifyToken,
  authorize(getPermission("CORE", "CITY", "VIEW")),
  getAllCities
);

/**
 * @swagger
 * /api/v1/city/{cityId}:
 *   get:
 *     summary: Retrieve a single city by ID
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID.
 */
cityRouter.get(
  "/:cityId",
  verifyToken,
  authorize(getPermission("CORE", "CITY", "VIEW")),
  getCityById
);

/**
 * @swagger
 * /api/v1/city/{cityId}:
 *   put:
 *     summary: Update a city's details
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/citySchema'
 */
cityRouter.put(
  "/",
  verifyToken,
  authorize(
    getPermission("CORE", "CITY", "VIEW"),
    getPermission("CORE", "CITY", "UPDATE")
  ),
  validateCityUpdate,
  updateCity
);

/**
 * @swagger
 * /api/v1/city/{cityId}:
 *   delete:
 *     summary: Delete a city
 *     tags: [City]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID to delete.
 */
cityRouter.delete(
  "/:cityId",
  verifyToken,
  authorize(getPermission("CORE", "CITY", "DELETE")),
  deleteCity
);

export default cityRouter;
