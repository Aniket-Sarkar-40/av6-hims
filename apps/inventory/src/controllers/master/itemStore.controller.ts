import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { itemStoreService } from "@/services/master/itemStore.service.js";
import { ItemStoreReq, ItemStoreUpdate } from "@/types/master/itemStore.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createItemStore = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createItemStore::controller");
  const input = req.body as ItemStoreReq;

  const itemStore = await itemStoreService.createItemStore(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: itemStore },
    "Item Store",
  );
  logger.info("exiting::createItemStore::controller");
  return res.status(201).json(response);
});

export const updateItemStore = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateItemStore::controller");
  const input = req.body as ItemStoreUpdate;

  const updateItemStore = await itemStoreService.updateItemStore(input);
  logger.info("exiting::updateItemStore::controller");
  const response = BaseResponse.success(
    { type: "UPDATED", data: updateItemStore },
    "Item Store",
  );
  return res.status(200).json(response);
});

export const getAllItemStore = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllItemStore::controller");
  const itemStore = await itemStoreService.getAllItemStore();
  logger.info("exiting::getAllItemStore::controller");
  const response = BaseResponse.success(
    { type: "FETCHED", data: itemStore },
    "Item Store",
  );
  return res.status(200).json(response);
});

export const getItemStoreById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemStoreById::controller");
    const { itemStoreId } = req.query as { itemStoreId: string };

    const itemStore = await itemStoreService.getItemStoreById(
      Number(itemStoreId),
    );

    if (!itemStore) {
      const response = BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Item Store"),
      });
      return res.status(404).json(response);
    }
    logger.info("exiting::getItemStoreById::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemStore },
      "Item Store",
    );
    return res.status(200).json(response);
  },
);
