import {
  getMedInstructionById,
  instructionCreate,
  medInstructionGet,
  updateMedInstruction,
} from "@/controllers/master/medInstruction.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validateInstructionName,
  validateInstructionNameUpdate,
} from "@/validations/request/master/instruction.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export const medInstructionRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Med Instruction
 *   description: Medicine Composition endpoints
 */

/**
 * @swagger
 * /api/v1/master/med-instruction:
 *   post:
 *     summary: Create a new Medicine Composition
 *     tags: [Med Instruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/InstructionNameSchema'
 *     responses:
 *       '201':
 *         description: Composition created
 *       '400':
 *         description: Validation error
 */
medInstructionRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_INSTRUCTIONS", "CREATE")),
  validateInstructionName,
  instructionCreate
);

/**
 * @swagger
 * /api/v1/master/med-instruction:
 *   get:
 *     summary: Retrieve all Medicine Compositions
 *     tags: [Med Instruction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of compositions
 */
medInstructionRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_INSTRUCTIONS", "VIEW")),
  medInstructionGet
);

/**
 * @swagger
 * /api/v1/master/med-instruction/id:
 *   get:
 *     summary: Retrieve a single Medicine Composition
 *     tags: [Med Instruction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Composition found
 *       '404':
 *         description: Composition not found
 */
medInstructionRouter.get(
  "/id",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "MEDICINE_INSTRUCTIONS", "VIEW")),
  getMedInstructionById
);

/**
 * @swagger
 * /api/v1/master/med-instruction:
 *   put:
 *     summary: Update an existing Medicine Composition
 *     tags: [Med Instruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/InstructionNameSchemaUpdate'
 *     responses:
 *       '200':
 *         description: Composition updated
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Composition not found
 */
medInstructionRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "MEDICINE_INSTRUCTIONS", "VIEW"),
    getPermission("PMS", "MEDICINE_INSTRUCTIONS", "UPDATE")
  ),
  validateInstructionNameUpdate,
  updateMedInstruction
);

export default medInstructionRouter;
