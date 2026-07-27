import { Router } from "express";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  createCollectionCenter,
  getAllCollectionCenter,
  getAvailableCollectionCenter,
  getBranchOrWarehouse,
  getCollectionCenterById,
  updateCollectionCenter,
} from "@/controllers/master/collectionCenter.controller.js";
import {
  validateCollectionCenter,
  validateCollectionCenterUpdate,
} from "@/validations/request/master/collectionCenter.validation.js";

export const collectionCenterRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Collection Center
 *   description: Collection Center management endpoints
 */

/**
 * @swagger
 * /api/v1/master/collection-center:
 *   post:
 *     summary: Create a new Collection Center
 *     tags: [Collection Center]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/collectionCenterSchema'
 */
collectionCenterRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "COLLECTION_CENTER", "CREATE")),
  validateCollectionCenter,
  createCollectionCenter,
);

/**
 * @swagger
 * /api/v1/master/collection-center:
 *   get:
 *     summary: Retrieve a list of Collection Center
 *     tags: [Collection Center]
 *     security:
 *       - bearerAuth: []
 */
collectionCenterRouter.get(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "COLLECTION_CENTER", "VIEW")),
  getAllCollectionCenter,
);

/**
 * @swagger
 * /api/v1/master/collection-center/avl:
 *   get:
 *     summary: Retrieve a list of Collection Center
 *     tags: [Collection Center]
 *     security:
 *       - bearerAuth: []
 */
collectionCenterRouter.get(
  "/avl",
  verifyToken(),
  authorize(getPermission("CORE", "COLLECTION_CENTER", "VIEW")),
  getAvailableCollectionCenter,
);

/**
 * @swagger
 * /api/v1/master/collection-center/id:
 *   get:
 *     summary: Retrieve a single Collection Center
 *     tags: [Collection Center]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
collectionCenterRouter.get(
  "/id",
  verifyToken(),
  authorize(getPermission("CORE", "COLLECTION_CENTER", "VIEW")),
  getCollectionCenterById,
);

/**
 * @swagger
 * /api/v1/master/collection-center:
 *   put:
 *     summary: Update a Collection Center's details
 *     tags: [Collection Center]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionCenterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The collectionCenter ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/collectionCenterSchemaUpdate'
 */
collectionCenterRouter.put(
  "/",
  verifyToken(),
  authorize(
    getPermission("CORE", "COLLECTION_CENTER", "VIEW"),
    getPermission("CORE", "COLLECTION_CENTER", "UPDATE"),
  ),
  validateCollectionCenterUpdate,
  updateCollectionCenter,
);

/**
 * @swagger
 * /api/v1/master/collection-center/search:
 *   get:
 *     summary: Retrieve a list of Branches or Warehouses
 *     tags: [Collection Center]
 *     security:
 *       - bearerAuth: []
 */
collectionCenterRouter.get(
  "/staffId",
  verifyToken(),
  authorize(getPermission("CORE", "COLLECTION_CENTER", "VIEW")),
  getBranchOrWarehouse,
);

export default collectionCenterRouter;
