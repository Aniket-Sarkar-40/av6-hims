import { collectionCenterGet } from "@/controllers/location/location.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const locationRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: Location management endpoints
 */

/**
 * @swagger
 * /api/v1/master/location:
 *   post:
 *     summary: Create a new Location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchSchema'
 */
locationRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("INV", "LOCATION", "VIEW")),
  collectionCenterGet,
);
