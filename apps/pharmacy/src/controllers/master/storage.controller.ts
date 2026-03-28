import { TryCatch } from "@repo/platform";
import { storageService } from "@/services/master/storage.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createStorage::controller");
  const input = req.body;
  const storage = await storageService.createStorage(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Storage"),
    },
    storage,
  );
  logger.info("exiting::createStorage::controller");
  return res.status(201).json(response);
});

export const updateStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateStorage::controller");
  const input = req.body;
  const storage = await storageService.updateStorage(input);
  logger.info("exiting::updateStorage::controller");
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("UPDATED", "Storage"),
    },
    storage,
  );
  return res.status(200).json(response);
});

export const getStorageById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getStorageById::controller");
  const { storageId } = req.query as { storageId: string };
  const storage = await storageService.getStorageById(Number(storageId));

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Storage"),
    },
    storage,
  );
  logger.info("exiting::getStorageById::controller");
  return res.status(200).json(response);
});

export const getAllStorage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllStorage::controller");
  const storage = await storageService.getAllStorage();
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Storage"),
    },
    storage,
  );
  logger.info("exiting::getAllStorage::controller");
  return res.status(200).json(response);
});
