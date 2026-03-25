import { collectionCenterGet } from "@/controllers/location/location.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { Router } from "express";

export const locationRouter = Router();

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
locationRouter.post("/", verifyToken, authorize(getPermission("LOCATION", "VIEW")), collectionCenterGet);
