import { TryCatch } from "@repo/platform";
import { monthOnMonthExpirationService } from "@/services/mis/monthOnMonthExpiration.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const getMisMonthOnMonthExpirationController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMisMonthOnMonthExpirationController::controller");
    const data =
      await monthOnMonthExpirationService.getMonthOnMonthExpiration();
    const response = new BaseResponse(
      { success: true, message: generateSuccessMessage("FETCHED", "Mis") },
      data,
    );
    logger.info("exiting::getMisMonthOnMonthExpirationController::controller");
    return res.status(201).json(response);
  },
);

export const excelMonthOnMonthExpirationReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelMonthOnMonthExpirationReport::controller");

    const wb: Workbook =
      await monthOnMonthExpirationService.buildExpirationMisWorkbook();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mis_month_on_month_expiration_report.xlsx"',
    );

    await wb.xlsx.write(res);
    res.end();
  },
);
