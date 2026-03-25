import { TryCatch } from "@/middlewares/error.middleware";
import { storageService } from "@/services/master/storage.service";
import { CreateOrUpdateStorage } from "@/types/master/storage";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { Request, Response } from "express";

export const createStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createStorage::controller");
  const input = req.body as CreateOrUpdateStorage;
  const storage = await storageService.createStorage(input);
  const response = BaseResponse.success({ type: "CREATED", data: storage }, "Storage");
  logger.info("exiting::createStorage::controller");
  return res.status(200).json(response);
});

export const updateStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateStorage::controller");
  const input = req.body as CreateOrUpdateStorage;
  const updatedStorage = await storageService.updateStorage(input);
  logger.info("exiting::updateStorage::controller");
  return res.status(201).json(BaseResponse.success({ type: "UPDATED", data: updatedStorage }, "Storage"));
});
