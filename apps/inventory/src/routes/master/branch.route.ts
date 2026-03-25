import {
  createBranch,
  getAllBranch,
  getBranchById,
  toggleActiveBranch,
  updateBranch,
} from "@/controllers/master/branch.controller";
import { authorize, verifyToken } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { validateToggleActive } from "@/validations/request/common.validation";
import { validateBranch } from "@/validations/request/master/branch.validation";
import { Router } from "express";

export const branchRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Branch
 *   description: Branch management endpoints
 */

/**
 * @swagger
 * /api/v1/master/branch:
 *   post:
 *     summary: Create a new Branch
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchSchema'
 */
branchRouter.post("/", verifyToken, authorize(getPermission("BRANCH", "CREATE")), validateBranch, createBranch);

/**
 * @swagger
 * /api/v1/master/branch:
 *   get:
 *     summary: Retrieve a list of Branch
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 */
branchRouter.get("/", verifyToken, authorize(getPermission("BRANCH", "VIEW")), getAllBranch);

/**
 * @swagger
 * /api/v1/master/branch/id:
 *   get:
 *     summary: Retrieve a single Branch
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Type found
 *       '404':
 *         description: Type not found
 */
branchRouter.get("/id", verifyToken, authorize(getPermission("BRANCH", "VIEW")), getBranchById);

/**
 * @swagger
 * /api/v1/master/branch/toggle-active:
 *   post:
 *     summary: active or Re-active a single Branch
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/toggleActiveSchema'
 */
branchRouter.post(
  "/toggle-active",
  verifyToken,
  authorize(getPermission("BRANCH", "VIEW"), getPermission("BRANCH", "UPDATE")),
  validateToggleActive,
  toggleActiveBranch
);

/**
 * @swagger
 * /api/v1/master/branch:
 *   put:
 *     summary: Update a Branch's details
 *     tags: [Branch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The branch ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/branchSchemaUpdate'
 */
branchRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("BRANCH", "VIEW"), getPermission("BRANCH", "UPDATE")),
  validateBranch,
  updateBranch
);
