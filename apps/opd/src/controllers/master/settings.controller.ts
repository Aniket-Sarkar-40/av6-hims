import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { settingsService } from "@/services/master/settings.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const upsertSettings = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::upsertSettings::controller");
  const input = req.body;
  const settings = await settingsService.upsertSettings(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: settings },
    "Settings",
  );
  logger.info("exiting::upsertSettings::controller");
  return res.status(200).json(response);
});

export const getSettings = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getSettings::controller");
  const settings = await settingsService.getSettings();
  const response = BaseResponse.success(
    { type: "FETCHED", data: settings },
    "Settings",
  );
  logger.info("exiting::getSettings::controller");
  return res.status(200).json(response);
});
