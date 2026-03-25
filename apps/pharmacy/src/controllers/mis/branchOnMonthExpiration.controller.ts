import { TryCatch } from "@repo/platform";
import { branchOnMonthExpirationService } from "@/services/mis/branchOnMonthExpiration.service.js";
import {
  HighestDrugSoldReq,
  SearchReqExcelWithDateRange,
} from "@/types/mis/branchOnMonthExpiration.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const getBranchOnMonthExpiration = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBranchOnMonthExpiration::controller");

    const input = req.body as SearchReqExcelWithDateRange;

    const result =
      await branchOnMonthExpirationService.branchOnMonthExpiration(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "FETCHED",
          "Branch on month expiration",
        ),
      },
      result,
    );

    logger.info("exiting::getBranchOnMonthExpiration::controller");
    return res.status(200).json(response);
  },
);

export const getBranchesOnMonthExpirationAmt = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBranchesOnMonthExpirationAmt::controller");

    const result =
      await branchOnMonthExpirationService.branchesOnMonthExpirationAmt();

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "FETCHED",
          "Branch on month expiration Amount",
        ),
      },
      result,
    );

    logger.info("exiting::getBranchesOnMonthExpirationAmt::controller");
    return res.status(200).json(response);
  },
);

export const getHighestSellingDrugByBranch = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getHighestSellingDrugByBranch::controller");

    const input = req.body as HighestDrugSoldReq;

    const result =
      await branchOnMonthExpirationService.highestSellingDrugByBranch(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "FETCHED",
          "Highest selling drug by branch",
        ),
      },
      result,
    );

    logger.info("exiting::getHighestSellingDrugByBranch::controller");
    return res.status(200).json(response);
  },
);

export const getHighestAmountSellDrugByBranch = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getHighestAmountSellDrugByBranch::controller");

    const input = req.body as HighestDrugSoldReq;

    const result =
      await branchOnMonthExpirationService.highestAmountSellDrugByBranch(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage(
          "FETCHED",
          "Highest sales amount drug by branch",
        ),
      },
      result,
    );

    logger.info("exiting::getHighestAmountSellDrugByBranch::controller");
    return res.status(200).json(response);
  },
);

export const getHighestSellingDrugByBranchExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getHighestSellingDrugByBranchExcel::controller");

    const { id, searchText, categoryId, startDate, endDate } =
      req.body as HighestDrugSoldReq;

    const wb: Workbook =
      await branchOnMonthExpirationService.buildHighestSellingDrugByBranchWorkbook(
        Number(id),
        searchText,
        categoryId,
        startDate,
        endDate,
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="highest_selling_quantity_by_branch.xlsx"',
    );

    logger.info("exiting::getHighestSellingDrugByBranchExcel::controller");
    await wb.xlsx.write(res);
    res.end();
  },
);

export const getHighestAmtSellingDrugByBranchExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getHighestAmtSellingDrugByBranchExcel::controller");

    const { id, searchText, categoryId, startDate, endDate } =
      req.body as HighestDrugSoldReq;

    const wb: Workbook =
      await branchOnMonthExpirationService.buildHighestAmtSellingDrugByBranchWorkbook(
        Number(id),
        searchText,
        categoryId,
        startDate,
        endDate,
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="highest_amount_selling_by_branch.xlsx"',
    );

    logger.info("exiting::getHighestAmtSellingDrugByBranchExcel::controller");
    await wb.xlsx.write(res);
    res.end();
  },
);
export const getBranchOnMonthExpirationExcel = TryCatch(async (req, res) => {
  const input = req.body as SearchReqExcelWithDateRange;

  const wb =
    await branchOnMonthExpirationService.buildBranchMonthExpirationWorkbook(
      input,
    );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="branch_on_month_expiration.xlsx"',
  );

  await wb.xlsx.write(res);
  res.end();
});
