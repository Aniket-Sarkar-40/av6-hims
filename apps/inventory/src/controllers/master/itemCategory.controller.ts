import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { itemCategoryService } from "@/services/master/itemCategory.service.js";
import {
  ItemCategoryReq,
  ItemCategoryUpdate,
} from "@/types/master/itemCategory.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createItemCategory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createItemCategory::controller");
    const input = req.body as ItemCategoryReq;
    const itemCategory = await itemCategoryService.createItemCategory(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: itemCategory },
      "Item Category",
    );
    logger.info("exiting::createItemCategory::controller");
    return res.status(201).json(response);
  },
);

export const updateItemCategory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemCategory::controller");
    const input = req.body as ItemCategoryUpdate;
    const updateItemCategory =
      await itemCategoryService.updateItemCategory(input);
    logger.info("exiting::updateItemCategory::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updateItemCategory },
      "Item Category",
    );
    return res.status(200).json(response);
  },
);

export const getAllItemCategory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllItemCategory::controller");
    const itemCategory = await itemCategoryService.getAllItemCategory();
    logger.info("exiting::getAllItemCategory::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemCategory },
      "Item Category",
    );
    return res.status(200).json(response);
  },
);

export const getItemCategoryById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemCategoryById::controller");
    const { itemCategoryId } = req.query as { itemCategoryId: string };

    const itemCategory = await itemCategoryService.getItemCategoryById(
      Number(itemCategoryId),
    );

    if (!itemCategory) {
      const response = BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Item Category"),
      });
      return res.status(404).json(response);
    }
    logger.info("exiting::getItemCategoryById::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemCategory },
      "Item Category",
    );
    return res.status(200).json(response);
  },
);
