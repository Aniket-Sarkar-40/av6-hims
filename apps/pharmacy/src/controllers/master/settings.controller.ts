import { TryCatch } from "@repo/platform";
import { settingsService } from "@/services/master/settings.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const upsertSettings = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::upsertSettings::controller");
  const input = req.body;
  const settings = await settingsService.upsertSettings(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Settings"),
    },
    settings,
  );
  logger.info("exiting::upsertSettings::controller");
  return res.status(201).json(response);
});

export const getSettings = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getSettings::controller");

  const settings = await settingsService.getSettings();

  logger.info("exiting::getSettings::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Settings"),
      },
      settings,
    ),
  );
});
