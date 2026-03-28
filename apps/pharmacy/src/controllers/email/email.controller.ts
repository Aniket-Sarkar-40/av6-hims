import { TryCatch } from "@repo/platform";
import { emailConfigService } from "@/services/master/emailConfig.service.js";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const upsertEmailConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::upsertEmailConfig::controller");
    const body = req.body as CreateOrUpdateEmailConfig;
    const emailConfig = await emailConfigService.upsertEmailConfig(body);
    logger.info("exiting::upsertEmailConfig::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", "Email Config"),
        },
        emailConfig,
      ),
    );
  },
);

export const getEmailConfig = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getEmailConfig::controller");
  const emailConfig = await emailConfigService.getEmailConfig();
  logger.info("exiting::getEmailConfig::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Email Config"),
      },
      emailConfig,
    ),
  );
});

export const getEventEmail = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getEventEmail::controller");
  const eventEmail = await emailConfigService.getEventEmail();
  logger.info("exiting::getEventEmail::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Event Email"),
      },
      eventEmail,
    ),
  );
});

export const deleteEmailConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteEmailConfig::controller");
    await emailConfigService.deleteEmailConfig();
    logger.info("exiting::deleteEmailConfig::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Email Config"),
      }),
    );
  },
);
