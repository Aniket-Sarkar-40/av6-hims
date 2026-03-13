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
  verifyToken,
  authorize(getPermission("CORE", "CACHE", "VIEW")),
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
  verifyToken,
  authorize(getPermission("CORE", "CACHE", "DELETE")),
  clearCacheController
);
cacheRouter.delete(
  "/all",
  verifyToken,
  authorize(getPermission("CORE", "CACHE", "DELETE")),
  clearAllCacheController
);

export default cacheRouter;
