import { TryCatch } from "@repo/platform";
import { itemInstructionService } from "@/services/item/itemInstructionMap.service.js";
import { CreateItemInstructionMap } from "@/types/item/itemDosageMap.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createItemInstructionMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createItemInstructionMap::controller");
    const input = req.body as CreateItemInstructionMap;
    await itemInstructionService.createItemInstructionMap(input);
    logger.info("exiting::createItemInstructionMap::controller");
    return res.status(201).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("CREATED", "Item Instruction mapping"),
      }),
    );
  },
);

export const updateItemInstructionMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemInstructionMap::controller");
    const input = req.body as CreateItemInstructionMap;
    await itemInstructionService.updateItemInstructionMap(input);
    logger.info("exiting::updateItemInstructionMap::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("UPDATED", "Item Instruction mapping"),
      }),
    );
  },
);

export const deleteItemInstruction = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteItemInstruction::controller");
    const id = req.params.id;
    await itemInstructionService.deleteItemInstructionMap(Number(id));
    logger.info("exiting::deleteItemInstruction::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Item Instruction mapping"),
      }),
    );
  },
);
