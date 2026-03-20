import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { generalBillItemService } from "@/services/master/generalBillItem.service.js";
import {
  CreateGeneralBillItemMasterInput,
  UpdateGeneralBillItemMasterInput,
} from "@/types/master/generalBillItem.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createGeneralBillItem = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createGeneralBillItem::controller");
    const input = req.body as CreateGeneralBillItemMasterInput;
    const created = await generalBillItemService.createGeneralBillItem(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "generalBillItem",
    );
    logger.info("exiting::createGeneralBillItem::controller");
    return res.status(201).json(response);
  },
);

export const updateGeneralBillItem = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateGeneralBillItem::controller");
    const input = req.body as UpdateGeneralBillItemMasterInput;
    const updated = await generalBillItemService.updateGeneralBillItem(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "generalBillItem",
    );
    logger.info("exiting::updateGeneralBillItem::controller");
    return res.status(200).json(response);
  },
);
