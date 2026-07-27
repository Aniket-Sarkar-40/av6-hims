import { getICDTenById } from "@/controllers/master/icdTen.controller.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const icdTenRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: ICD Ten
 *   description: ICD Ten management endpoints
 */

/**
 * @swagger
 * /api/v1/master/icd-ten/{id}:
 *   get:
 *     summary: Retrieve ICD Ten by ID
 *     tags: [ICD Ten]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
icdTenRouter.get(
  "/id",
  verifyToken(ServiceCode.OPD),
  authorize(getPermission("OPD", "ICD_TEN", "VIEW")),
  getICDTenById,
);
