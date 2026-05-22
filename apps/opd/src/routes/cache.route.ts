import { Router } from "express";

import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";

import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  clearAllCacheController,
  clearCacheController,
  getAllCacheController,
} from "@/controllers/cache.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

const cacheRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Cache
 *   description: Cache management endpoints
 */

/**
 * @swagger
 * /api/v1/cache:
 *   get:
 *     summary: Retrieve a list of cities
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 */
cacheRouter.post(
  "/load",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CACHE", "VIEW")),
  getAllCacheController
);
/**
 * @swagger
 * /api/v1/cache:
 *   delete:
 *     summary: Delete a cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cacheId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cache ID to delete.
 */
cacheRouter.delete(
  "/delete",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CACHE", "DELETE")),
  clearCacheController
);
cacheRouter.delete(
  "/all",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "CACHE", "DELETE")),
  clearAllCacheController
);

export default cacheRouter;
