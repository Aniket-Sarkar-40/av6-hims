import { Router } from "express";

import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  clearAllCacheController,
  clearCacheController,
  getAllCacheController,
} from "@/controllers/cacheController/cache.controller.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CACHE", "VIEW")),
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
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CACHE", "DELETE")),
  clearCacheController
);
cacheRouter.delete(
  "/all",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "CACHE", "DELETE")),
  clearAllCacheController
);

export default cacheRouter;
