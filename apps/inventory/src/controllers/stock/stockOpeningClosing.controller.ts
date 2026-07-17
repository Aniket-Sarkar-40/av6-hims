import { stockOpeningClosingService } from "@/services/stock/stockOpeningClosing.service.js";
import { StockOpeningClosingFilter } from "@/types/stock/stockOpeningClosing.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const getOpeningClosingStockById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getOpeningClosingStockById::controller");
    const input = req.body as StockOpeningClosingFilter;
    const response = await stockOpeningClosingService.getOpeningClosingStock(
      input
    );

    logger.info("exiting::getOpeningClosingStockById::controller");
    return res.status(200).json(
      BaseResponse.success(
        {
          type: "FETCHED",
          data: response,
        },
        "Opening Closing Stock"
      )
    );
  }
);
