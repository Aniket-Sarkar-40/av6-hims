import { TryCatch } from "@/middlewares/error.middleware";
import { stockAdjustmentService } from "@/services/stock/stockAdjustment.service";
import { CreateStockAjustmentInput, UpdateStockAjustmentInput } from "@/types/stock/stockAdjustment";

import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage, generateSuccessMessage } from "@/utils/responseMessage.utils";
import { Request, Response } from "express";

export const createStockAdjustment = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createStockAdjustment::controller");
  const input = req.body as CreateStockAjustmentInput;
  const result = await stockAdjustmentService.createStockAdjustment(input);
  if (Array.isArray(result)) {
    return res.status(400).json(
      BaseResponse.errorCustomMsg({
        message: "Current available quantity and Previous available quantity mismatch",
        data: result,
      })
    );
  }

  if (!result) {
    return res.status(400).json(
      BaseResponse.error({
        message: generateErrorMessage("FAILED", "Stock Adjustment"),
      })
    );
  }
  logger.info("exiting::createStockAdjustment::controller");
  return res.status(201).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("CREATED", "Stock Adjustment"),
    })
  );
});

export const updateStockAdjustment = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateStockAdjustment::controller");
  const input = req.body as UpdateStockAjustmentInput;
  const result = await stockAdjustmentService.updateStockAdjustment(input);
  if (Array.isArray(result)) {
    return res.status(400).json(
      BaseResponse.errorCustomMsg({
        message: "Current available quantity and Previous available quantity mismatch",
        data: result,
      })
    );
  }

  if (!result) {
    return res.status(400).json(
      BaseResponse.error({
        message: generateErrorMessage("FAILED", "Stock Adjustment"),
      })
    );
  }
  logger.info("exiting::updateStockAdjustment::controller");
  return res.status(201).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPDATED", "Stock Adjustment"),
    })
  );
});

export const getStockAdjustmentById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getStockAdjustmentById::controller");
  const { stockAdjustementId } = req.query as { stockAdjustementId: string };
  const record = await stockAdjustmentService.getStockAdjustmentById(Number(stockAdjustementId));

  logger.info("exiting::getStockAdjustmentById::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Stock Adjustment"),
      },
      record
    )
  );
});
