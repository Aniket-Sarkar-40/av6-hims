import { TryCatch } from "@repo/platform";
import { insurancePaymentSettingsService } from "@/services/insurance/insurancePaymentSettings.service.js";
import { InsurancePaymentSettingsFilterReq } from "@/types/insurance/insurancePaymentSettings.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const getAllInsurancePaymentSettings = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllInsurancePaymentSettings::controller");
    const { insuranceId, ccId, medId } =
      req.body as InsurancePaymentSettingsFilterReq;
    const insurancePaymentSettings =
      await insurancePaymentSettingsService.getInsurancePaymentSettingsByFilter(
        insuranceId,
        ccId,
        medId,
      );
    logger.info("exiting::getAllInsurancePaymentSettings::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage(
            "FETCHED",
            "Insurance Payment Settings",
          ),
        },
        insurancePaymentSettings,
      ),
    );
  },
);
