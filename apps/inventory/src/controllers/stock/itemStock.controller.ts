import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { itemStockService } from "@/services/stock/itemStock.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const getItemStockSummary = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemStockSummary::controller");
    const { ccId } = req.query as { ccId: string };
    const itemStock = await itemStockService.getAllItemStockSummary(
      Number(ccId),
    );
    logger.info("exiting::getItemStockSummary::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemStock },
      "Item Stock Summary",
    );
    return res.status(200).json(response);
  },
);
export const getItemStock = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getItemStock::controller");
  const { ccId } = req.query as { ccId: string };
  const itemStock = await itemStockService.getAllItemStock(Number(ccId));
  logger.info("exiting::getItemStock::controller");
  const response = BaseResponse.success(
    { type: "FETCHED", data: itemStock },
    "Item Stock",
  );
  return res.status(200).json(response);
});

export const exportItemStockExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::exportItemStockExcel::controller");
    const { ccId } = req.query as { ccId: string };
    const workbook = await itemStockService.itemStockExcelExport(Number(ccId));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=item-stock-export-${ccId}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
    logger.info("exiting::exportItemStockExcel::controller");
  },
);
