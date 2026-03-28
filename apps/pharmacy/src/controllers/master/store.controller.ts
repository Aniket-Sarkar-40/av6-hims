import { TryCatch } from "@repo/platform";
import { storeService } from "@/services/master/store.service.js";
import { StoreCreateInput, StoreUpdateInput } from "@/types/master/store.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createStore = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createStore::controller");
  const input = req.body as StoreCreateInput;
  const store = await storeService.createStore(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Store"),
    },
    store,
  );
  logger.info("exiting::createStore::controller");
  return res.status(201).json(response);
});

export const updateStore = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateStore::controller");
  const input = req.body as StoreUpdateInput;
  const updateStore = await storeService.updateStore(input);
  logger.info("exiting::updateStore::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Store"),
      },
      updateStore,
    ),
  );
});

export const getAllStore = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllStore::controller");
  const stores = await storeService.getAllStore();
  logger.info("exiting::getAllStore::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Store"),
      },
      stores,
    ),
  );
});
