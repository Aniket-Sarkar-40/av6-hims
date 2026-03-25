import { TryCatch } from "@repo/platform";
import { misBranchService } from "@/services/mis/misBranch.service.js";
import { SearchRequestMisBranch } from "@/types/mis/misBranch.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const misBranchList = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::misBranchList::controller");

  const input = req.body as SearchRequestMisBranch;

  const result = await misBranchService.branchMisList(input);

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Mis Branch"),
    },
    result,
  );

  logger.info("exiting::misBranchList::controller");
  return res.status(200).json(response);
});
export const excelMisBranch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::excelMisBranch::controller");

  const input = req.body as SearchRequestMisBranch;

  const wb: Workbook =
    await misBranchService.buildItemStockReportWorkbook(input);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="mis_branch_report.xlsx"',
  );

  await wb.xlsx.write(res);
  res.end();
});
