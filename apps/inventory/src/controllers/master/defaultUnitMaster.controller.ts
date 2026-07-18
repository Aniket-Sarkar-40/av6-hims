import { defaultUnitMasterService } from "@/services/master/defaultUnitMaster.service.js";
import { DefaultUnitMasterReq } from "@/types/master/defaultUnitMaster.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createDefaultUnitMaster = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createDefaultUnitMaster::controller");
    const input = req.body as DefaultUnitMasterReq;

    const defaultUnitMaster =
      await defaultUnitMasterService.createDefaultUnitMaster(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: defaultUnitMaster },
      "Default Unit Master",
    );
    logger.info("exiting::createDefaultUnitMaster::controller");
    return res.status(201).json(response);
  },
);

export const updateDefaultUnitMaster = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateDefaultUnitMaster::controller");
    const input = req.body as DefaultUnitMasterReq;

    const updatedDefaultUnitMaster =
      await defaultUnitMasterService.updateDefaultUnitMaster(input);
    logger.info("exiting::updateDefaultUnitMaster::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedDefaultUnitMaster },
      "Default Unit Master",
    );
    return res.status(200).json(response);
  },
);
