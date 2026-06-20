import { CreateOrUpdateAccountingIntegrationConfigInput } from "@/types/integrationConfig/accountingIntegrationConfig.js";
import { IntegrationConfigKeysKeys } from "@/types/voucher/voucher.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { accountingIntegrationConfigService } from "@/services/integrationConfig/accountingIntegrationConfig.service.js";

export const createAccountingIntegrationConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createAccountingIntegrationConfig::controller");
    const input = req.body as CreateOrUpdateAccountingIntegrationConfigInput;
    const created =
      await accountingIntegrationConfigService.createAccountingIntegrationConfig(
        input
      );
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Accounting Integration Config"
    );
    logger.info("exiting::createAccountingIntegrationConfig::controller");
    return res.status(201).json(response);
  }
);

export const updateAccountingIntegrationConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateAccountingIntegrationConfig::controller");
    const input = req.body as CreateOrUpdateAccountingIntegrationConfigInput;
    const updated =
      await accountingIntegrationConfigService.updateAccountingIntegrationConfig(
        input
      );
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Accounting Integration Config"
    );
    logger.info("exiting::updateAccountingIntegrationConfig::controller");
    return res.status(200).json(response);
  }
);

export const getIntegrationConfigKeys = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getIntegrationConfigKeys::controller");
    const keys = IntegrationConfigKeysKeys;
    const response = BaseResponse.success(
      { type: "SUCCESS", data: keys },
      "Integration Config Keys"
    );
    logger.info("exiting::getIntegrationConfigKeys::controller");
    return res.status(200).json(response);
  }
);
