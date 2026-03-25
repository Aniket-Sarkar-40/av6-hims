import { coreRequests } from "@/client/core/request";
import { TryCatch } from "@/middlewares/error.middleware";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { Request, Response } from "express";

export const collectionCenterGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::collectionCenterGet::controller");
  const { id } = req.query as { id: string };

  const collectionCenter = await coreRequests.getCollectionCentersForStaff(Number(id));
  logger.info("exiting::collectionCenterGet::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: collectionCenter }, "Collection Center");
  return res.status(200).json(response);
});
