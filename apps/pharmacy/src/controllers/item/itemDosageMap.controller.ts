import { TryCatch } from "@repo/platform";
import { itemDosageService } from "@/services/item/itemDosageMap.service.js";
import { CreateItemDosageMap } from "@/types/item/itemDosageMap.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createItemDosageMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createItemDosageMap::controller");
    const input = req.body as CreateItemDosageMap;
    await itemDosageService.createItemDosageMap(input);
    logger.info("exiting::createItemDosageMap::controller");
    return res.status(201).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("CREATED", "Item Dosage mapping"),
      }),
    );
  },
);

export const updateItemDosageMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemDosageMap::controller");
    const input = req.body as CreateItemDosageMap;
    await itemDosageService.updateItemDosageMap(input);
    logger.info("exiting::updateItemDosageMap::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("UPDATED", "Item Dosage mapping"),
      }),
    );
  },
);

export const deleteItemDosage = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteItemDosage::controller");
    const id = req.params.id;
    await itemDosageService.deleteItemDosageMap(Number(id));
    logger.info("exiting::deleteItemDosage::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Item Dosage mapping"),
      }),
    );
  },
);
