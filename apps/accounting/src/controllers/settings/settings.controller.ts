import { CreateOrUpdateSettings } from "@/types/settings/settings.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { settingsService } from "@/services/settings/settings.service.js";

export const upsertSettings = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::upsertSettings::controller");
  const body = req.body as CreateOrUpdateSettings;

  const setting = await settingsService.upsertSettings(body);

  const response = BaseResponse.success(
    {
      data: setting,
      type: body.id ? "UPDATED" : "CREATED",
    },
    "settings",
  );

  logger.info("exiting::upsertSettings::controller");
  return res.status(body.id ? 200 : 201).json(response);
});

export const getSettings = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getSettings::controller");

  const setting = await settingsService.getSettings();

  if (!setting) {
    const response = BaseResponse.error({
      message: generateErrorMessage("NOT_FOUND", "Settings"),
    });
    logger.info("exiting::getSettings::controller");
    return res.status(404).json(response);
  }

  const response = BaseResponse.success(
    {
      data: setting,
      type: "FETCHED",
    },
    "settings",
  );

  logger.info("exiting::getSettings::controller");
  return res.status(200).json(response);
});
