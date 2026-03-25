import { TryCatch } from "@repo/platform";
import { misStoreRequisitionService } from "@/services/mis/misStoreRequisition.service.js";
import { SearchRequestMisStoreRequisition } from "@/types/mis/misStoreRequisition.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const misStoreRequisitionList = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::misStoreRequisition::controller");
    const input = req.body as SearchRequestMisStoreRequisition;

    const result =
      await misStoreRequisitionService.storeRequisistionMisList(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Mis Store Requisition"),
      },
      result,
    );

    logger.info("exiting::misStoreRequisition::controller");
    return res.status(200).json(response);
  },
);

export const excelMisStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelMisStoreRequisition::controller");

    const {
      pageNo,
      pageSize,
      sortDir = "ASC",
      branchId,
    } = req.body as SearchRequestMisStoreRequisition;

    const wb: Workbook =
      await misStoreRequisitionService.buildStoreRequisitionReportWorkbook(
        pageNo,
        pageSize,
        sortDir,
        branchId,
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="mis_store_requisition_report.xlsx"',
    );

    await wb.xlsx.write(res);
    res.end();
  },
);
