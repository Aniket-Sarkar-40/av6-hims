import { getPathologyMasterById } from "@/controllers/pathology/pathologyMaster.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const pathologyMasterRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Pathology Master
 *   description: Pathology Master management endpoints
 */

/**
 * @swagger
 * /api/v1/pathology/pathology-master:
 *   get:
 *     summary: get pathology master by id
 *     tags: [Pathology Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pathologyMasterId
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the pathology master to get
 */

pathologyMasterRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "PATHOLOGY_MASTER", "VIEW")),
  getPathologyMasterById,
);
