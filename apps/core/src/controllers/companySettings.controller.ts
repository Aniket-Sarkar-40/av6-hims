import { companySettingsService } from "@/services/companySettings.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const getCompanySettings = TryCatch(
  async (_req: Request, res: Response) => {
    logger.info("entering::getCompanySettings::controller");
    const data = await companySettingsService.getAllCompanySettings();
    logger.info("exiting::getCompanySettings::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Company settings"),
        },
        data,
      ),
    );
  },
);
