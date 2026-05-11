import { emailConfigService } from "@/services/master/emailConfig.service.js";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const upsertEmailConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::upsertEmailConfig::controller");

    const body = req.body as CreateOrUpdateEmailConfig;

    const emailConfig = await emailConfigService.upsertEmailConfig(body);

    const response = BaseResponse.success(
      { data: emailConfig, type: "UPDATED" },
      "emailConfig"
    );

    logger.info("exiting::upsertEmailConfig::controller");
    return res.status(200).json(response);
  }
);
