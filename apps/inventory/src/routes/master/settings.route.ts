import { Router } from "express";
import { verifyToken, authorize } from "@/middlewares/auth.middleware";
import { getPermission } from "@/utils/permissions.utils";
import { getSettings, upsertSettings } from "@/controllers/master/settings.controller";
import { validateSettings } from "@/validations/request/master/settings.validation";

const settingsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management endpoints
 */

/**
 * @swagger
 * /api/v1/master/settings:
 *   post:
 *     summary: Create a new Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/settingsSchema'
 */
settingsRouter.post("/", verifyToken, authorize(getPermission("SETTING", "CREATE")), validateSettings, upsertSettings);

/**
 * @swagger
 * /api/v1/master/settings:
 *   get:
 *     summary: Retrieve a list of Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
settingsRouter.get("/", verifyToken, authorize(getPermission("SETTING", "VIEW")), getSettings);

export default settingsRouter;
