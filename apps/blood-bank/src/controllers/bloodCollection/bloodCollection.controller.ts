import { bloodCollectionService } from "@/services/bloodCollection/bloodCollection.service.js";
import { CreateOrUpdateBloodCollection } from "@/types/bloodCollection/bloodCollection.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const upsertBloodCollection = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::upsertBloodCollection::controller");
    const input = req.body as CreateOrUpdateBloodCollection;
    const updated = await bloodCollectionService.upsertBloodCollection(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Blood Collection",
    );
    logger.info("exiting::upsertBloodCollection::controller");
    return res.status(200).json(response);
  },
);
