import { CreateOrUpdateCompanyFinancialYear } from "@/types/master/companyFinancialYear.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";
import { companyFinancialYearService } from "@/services/master/companyFinancialYear.service.js";

export const createCompanyFinancialYear = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createCompanyFinancialYear::controller");
    const input = req.body as CreateOrUpdateCompanyFinancialYear;
    const created =
      await companyFinancialYearService.createCompanyFinancialYear(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "CompanyFinancialYear"
    );
    logger.info("exiting::createCompanyFinancialYear::controller");
    return res.status(201).json(response);
  }
);

export const updateCompanyFinancialYear = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateCompanyFinancialYear::controller");
    const input = req.body as CreateOrUpdateCompanyFinancialYear;
    const updated =
      await companyFinancialYearService.updateCompanyFinancialYear(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "CompanyFinancialYear"
    );
    logger.info("exiting::updateCompanyFinancialYear::controller");
    return res.status(200).json(response);
  }
);
