import { Router } from "express";
import {
  verifyToken,
  authorize,
} from "@repo/platform/middlewares/auth.middleware.js";
import {
  createState,
  deleteState,
  getAllStates,
  getStateById,
  updateState,
} from "@/controllers/master/state.controller.js";
import {
  validateState,
  validateStateUpdate,
} from "@/validations/request/master/state.validation.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";

const stateRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: State
 *   description: State management endpoints
 */

/**
 * @swagger
 * /api/v1/state:
 *   post:
 *     summary: Create a new state
 *     tags: [State]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/stateSchema'
 */
stateRouter.post(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "STATE", "CREATE")),
  validateState,
  createState
);

/**
 * @swagger
 * /api/v1/state:
 *   get:
 *     summary: Retrieve a list of states
 *     tags: [State]
 *     security:
 *       - bearerAuth: []
 */
stateRouter.get(
  "/",
  verifyToken(),
  authorize(getPermission("CORE", "STATE", "VIEW")),
  getAllStates
);

/**
 * @swagger
 * /api/v1/state/{stateId}:
 *   get:
 *     summary: Retrieve a single state by ID
 *     tags: [State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The state ID.
 */
stateRouter.get(
  "/:stateId",
  verifyToken(),
  authorize(getPermission("CORE", "STATE", "VIEW")),
  getStateById
);

/**
 * @swagger
 * /api/v1/state/:
 *   put:
 *     summary: Update a state's details
 *     tags: [State]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/stateSchema'
 */
stateRouter.put(
  "/",
  verifyToken(),
  authorize(
    getPermission("CORE", "STATE", "VIEW"),
    getPermission("CORE", "STATE", "UPDATE")
  ),
  validateStateUpdate,
  updateState
);

/**
 * @swagger
 * /api/v1/state/{stateId}:
 *   delete:
 *     summary: Delete a state
 *     tags: [State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The state ID to delete.
 */
stateRouter.delete(
  "/:stateId",
  verifyToken(),
  authorize(getPermission("CORE", "STATE", "DELETE")),
  deleteState
);

export default stateRouter;
