import { auditConfigService } from "@/services/master/auditConfig.service.js";
import { CreateOrUpdateAuditConfig } from "@/types/master/auditConfig.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createAuditConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createAuditConfig::controller");
    const input = req.body as CreateOrUpdateAuditConfig;
    const created = await auditConfigService.createAuditConfig(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Audit Config"
    );
    logger.info("exiting::createAuditConfig::controller");
    return res.status(201).json(response);
  }
);

export const updateAuditConfig = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateAuditConfig::controller");
    const input = req.body as CreateOrUpdateAuditConfig;
    const updated = await auditConfigService.updateAuditConfig(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Audit Config"
    );
    logger.info("exiting::updateAuditConfig::controller");
    return res.status(200).json(response);
  }
);
