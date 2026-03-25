import {
  createUnitMaster,
  getAllUnitMaster,
  getUnitMasterById,
  updateUnitMaster,
} from "@/controllers/master/unitMaster.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { validateUnitMasterCreate, validateUnitMasterUpdate } from "@/validations/request/master/unitMaster.validation";
import { Router } from "express";

export const unitMasterRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Unit Master
 *   description: Unit Master management endpoints
 */

/**
 * @swagger
 * /api/v1/master/unit-master:
 *   post:
 *     summary: Create a new Unit Master
 *     tags: [Unit Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/unitMasterSchema'
 */
unitMasterRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("UNIT_MASTER", "CREATE")),
  validateUnitMasterCreate,
  createUnitMaster
);

/**
 * @swagger
 * /api/v1/master/unit-master:
 *   get:
 *     summary: Retrieve a list of Unit Master
 *     tags: [Unit Master]
 *     security:
 *       - bearerAuth: []
 */
unitMasterRouter.get("/", verifyToken, authorize(getPermission("UNIT_MASTER", "VIEW")), getAllUnitMaster);

/**
 * @swagger
 * /api/v1/master/unit-master/id:
 *   get:
 *     summary: Retrieve a single Unit Master
 *     tags: [Unit Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
unitMasterRouter.get("/id", verifyToken, authorize(getPermission("UNIT_MASTER", "VIEW")), getUnitMasterById);

/**
 * @swagger
 * /api/v1/master/unit-master:
 *   put:
 *     summary: Update a Unit Master's details
 *     tags: [Unit Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitMasterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unitMaster ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/unitMasterSchemaUpdate'
 */
unitMasterRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("UNIT_MASTER", "VIEW"), getPermission("UNIT_MASTER", "UPDATE")),
  validateUnitMasterUpdate,
  updateUnitMaster
);
