import { getCompanySettings } from "@/controllers/companySettings.controller.js";
import { Router } from "express";

export const companySettingsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: CompanySettings
 *   description: Company / school settings (public read)
 */

/**
 * @swagger
 * /api/v1/company-settings:
 *   get:
 *     summary: Get all company settings
 *     tags: [CompanySettings]
 *     responses:
 *       200:
 *         description: OK
 */
companySettingsRouter.get("/", getCompanySettings);
