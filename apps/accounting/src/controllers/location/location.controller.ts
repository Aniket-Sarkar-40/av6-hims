import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { collectionCenterService } from "@apps/core/services/master/collectionCenter.service.js";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";

export const getCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCollectionCenter::controller");
    const { staffId } = req.query as { staffId: string };

    const collectionCenter =
      await collectionCenterService.getCollectionCentersForStaff(
        Number(staffId)
      );
    logger.info("exiting::getCollectionCenter::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: collectionCenter },
      "Collection Center"
    );
    return res.status(200).json(response);
  }
);
