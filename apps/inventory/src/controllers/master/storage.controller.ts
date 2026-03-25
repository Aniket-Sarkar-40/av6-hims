import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { storageService } from "@/services/master/storage.service.js";
import { CreateOrUpdateStorage } from "@/types/master/storage.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createStorage::controller");
  const input = req.body as CreateOrUpdateStorage;
  const storage = await storageService.createStorage(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: storage },
    "Storage",
  );
  logger.info("exiting::createStorage::controller");
  return res.status(200).json(response);
});

export const updateStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateStorage::controller");
  const input = req.body as CreateOrUpdateStorage;
  const updatedStorage = await storageService.updateStorage(input);
  logger.info("exiting::updateStorage::controller");
  return res
    .status(201)
    .json(
      BaseResponse.success(
        { type: "UPDATED", data: updatedStorage },
        "Storage",
      ),
    );
});
