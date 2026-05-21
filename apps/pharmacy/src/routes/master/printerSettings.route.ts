import {
  createPrinterSettings,
  getPrinterSettings,
  getPrinterSettingsByCCAndType,
  updatePrinterSettings,
} from "@/controllers/master/printerSettings.controller.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import {
  validatePrinterSettings,
  validateUpdatePrinterSettings,
} from "@/validations/request/master/printerSettings.validation.js";
import { Router } from "express";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

const printerSettingsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management endpoints
 */

/**
 * @swagger
 * /api/v1/master/printer-settings:
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
 *             $ref: '#/components/createPrinterSettingsSchema'
 */
printerSettingsRouter.post(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "PRINTER_SETTINGS", "CREATE")),
  validatePrinterSettings,
  createPrinterSettings
);
/**
 * @swagger
 * /api/v1/master/printer-settings:
 *   put:
 *     summary: Create a new Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/updatePrinterSettingsSchema'
 */
printerSettingsRouter.put(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(
    getPermission("PMS", "PRINTER_SETTINGS", "UPDATE"),
    getPermission("PMS", "PRINTER_SETTINGS", "VIEW")
  ),
  validateUpdatePrinterSettings,
  updatePrinterSettings
);

/**
 * @swagger
 * /api/v1/master/printer-settings:
 *   get:
 *     summary: Retrieve a list of Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
printerSettingsRouter.get(
  "/",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "PRINTER_SETTINGS", "VIEW")),
  getPrinterSettings
);

/**
 * @swagger
 * /api/v1/master/printer-settings/cc-type:
 *   get:
 *     summary: Retrieve a list of Settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
printerSettingsRouter.get(
  "/cc-type",
  verifyToken(ServiceCode.PHARMACY),
  authorize(getPermission("PMS", "PRINTER_SETTINGS", "VIEW")),
  getPrinterSettingsByCCAndType
);

export default printerSettingsRouter;
