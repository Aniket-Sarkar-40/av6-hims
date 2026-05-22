import { getCollectionCenter } from "@/controllers/location/location.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { verifyToken } from "@repo/platform/middlewares/auth.middleware.js";
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
 * /location:
 *   get:
 *     summary: Get Collection Centers for a Staff Member
 *     tags: [Location]
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: sting
 *         required: true
 *         description: Numeric ID of the staff member to get collection centers for
 */
locationRouter.get("/", verifyToken(ServiceCode.OPD), getCollectionCenter);
