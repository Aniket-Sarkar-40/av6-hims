import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { chipsButtonMappingService } from "@/services/master/chipsButtonMapping.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createChipsButtonMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createChipsButtonMapping::controller");
    const input = req.body;
    const created =
      await chipsButtonMappingService.createChipsButtonMapping(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Chips Button Mapping",
    );
    logger.info("exiting::createChipsButtonMapping::controller");
    return res.status(201).json(response);
  },
);

export const updateChipsButtonMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateChipsButtonMapping::controller");
    const input = req.body;
    const updated =
      await chipsButtonMappingService.updateChipsButtonMapping(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Chips Button Mapping",
    );
    logger.info("exiting::updateChipsButtonMapping::controller");
    return res.status(200).json(response);
  },
);
