import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { collectionCenterService } from "@apps/core/services/master/collectionCenter.service.js";

export const collectionCenterGet = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::collectionCenterGet::controller");
    const { id } = req.query as { id: string };

    const collectionCenter =
      await collectionCenterService.getCollectionCentersForStaff(Number(id));
    logger.info("exiting::collectionCenterGet::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: collectionCenter },
      "Collection Center",
    );
    return res.status(200).json(response);
  },
);
