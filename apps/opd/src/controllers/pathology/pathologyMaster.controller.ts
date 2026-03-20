import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { pathologyMasterService } from "@/services/pathology/pathologyMaster.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const getPathologyMasterById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPathologyMasterById::controller");
    const { pathologyMasterId } = req.query as { pathologyMasterId: string };
    const phatoMaster = await pathologyMasterService.getPathologyMasterById(
      Number(pathologyMasterId),
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: phatoMaster },
      "Pathology Master",
    );
    logger.info("exiting::getPathologyMasterById::controller");
    return res.status(200).json(response);
  },
);
