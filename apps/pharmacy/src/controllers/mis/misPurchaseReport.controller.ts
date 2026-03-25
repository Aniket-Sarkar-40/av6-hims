import { TryCatch } from "@repo/platform";
import { misPurchaseReportService } from "@/services/mis/misPurchaseReport.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const misPurchaseReportList = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::misPurchaseReportList::controller");

    const result = await misPurchaseReportService.purchaseReportMisList();

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Mis Purchase Report"),
      },
      result,
    );

    logger.info("exiting::misPurchaseReportList::controller");
    return res.status(200).json(response);
  },
);

export const excelMisPurchaseReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelMisBranch::controller");

    const wb: Workbook =
      await misPurchaseReportService.buildGoodReceiveDashboardWorkbook();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mis_purchase_report.xlsx"',
    );

    await wb.xlsx.write(res);
    res.end();
  },
);
