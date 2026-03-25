import { TryCatch } from "@repo/platform";
import { misSaleService } from "@/services/mis/misSale.service.js";
import { SellInformationFilters } from "@/types/mis/sellMis.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const misSaleList = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::misSaleList::controller");

  const result = await misSaleService.saleMisList();

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Mis Sale"),
    },
    result,
  );

  logger.info("exiting::misSaleList::controller");
  return res.status(200).json(response);
});

export const excelMisSaleReport = TryCatch(
  async (req: Request, res: Response) => {
    const wb: Workbook = await misSaleService.buildMisSaleReportWorkbook();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mis_sell_report_month_wise.xlsx"`,
    );
    await wb.xlsx.write(res);
    res.end();
  },
);

export const getSellMisController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getSellMisController::controller");

    const input = req.body as SellInformationFilters;

    const result = await misSaleService.getSellMis(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Mis Sale"),
      },
      result,
    );

    logger.info("exiting::misSaleList::controller");
    return res.status(200).json(response);
  },
);

export const getSellMisExcelController = TryCatch(
  async (req: Request, res: Response) => {
    const input = req.body as SellInformationFilters;
    const wb: Workbook =
      await misSaleService.buildSellInformationWorkbook(input);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mis_sell_report.xlsx"`,
    );
    await wb.xlsx.write(res);
    res.end();
  },
);
