import { chartOfAccountsService } from "@/services/master/chartOfAccount.service.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const fetchChartOfAccounts = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::fetchChartOfAccounts::controller");
    const { companyId } = req.query as { companyId: string };
    const fetchedData = await chartOfAccountsService.fetchChartOfAccounts(
      Number(companyId)
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: fetchedData },
      "Chart Of Accounts"
    );
    logger.info("exiting::fetchChartOfAccounts::controller");
    return res.status(200).json(response);
  }
);

export const exportChartOfAccountsExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::exportChartOfAccountsExcel::controller");
    const { companyId } = req.query as { companyId: string };
    const wb: Workbook =
      await chartOfAccountsService.exportChartOfAccountsExcel(
        Number(companyId)
      );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="chart_of_accounts.xlsx"'
    );
    await wb.xlsx.write(res);
    res.end();
    logger.info("exiting::exportChartOfAccountsExcel::controller");
  }
);
