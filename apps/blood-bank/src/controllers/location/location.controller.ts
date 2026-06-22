import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { collectionCenterService } from "@apps/core/services/master/collectionCenter.service.js";

export const getCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCollectionCenter::controller");
    const { staffId } = req.query as { staffId: string };

    const collectionCenters =
      await collectionCenterService.getCollectionCentersForStaff(
        Number(staffId),
      );
    logger.info("exiting::getCollectionCenter::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: collectionCenters },
      "Collection Center",
    );
    return res.status(200).json(response);
  },
);
