import { TryCatch } from "@repo/platform";
import { misSupplierPaymentService } from "@/services/mis/misSupplierPayment.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const misSupplierPaymentList = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::misBranchList::controller");

    const { startDate, endDate } = req.body;
    const result = await misSupplierPaymentService.SupplierPaymentMisList(
      startDate,
      endDate,
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Mis Supplier Payment List"),
      },
      result,
    );

    logger.info("exiting::misBranchList::controller");
    return res.status(200).json(response);
  },
);

export const excelMisSupplierReport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelMisSupplierReport::controller");
    const { startDate, endDate } = req.body;
    const wb: Workbook =
      await misSupplierPaymentService.buildSupplierPaymentScheduleWorkbook(
        startDate,
        endDate,
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mis_supplier_report.xlsx"',
    );

    await wb.xlsx.write(res);
    res.end();
  },
);
