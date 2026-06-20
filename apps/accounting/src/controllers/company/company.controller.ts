import { CreateOrUpdateCompanyInput } from "@/types/company/company.js";
import { Request, Response } from "express";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { companyService } from "@/services/company/company.service.js";

export const createCompany = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCompany::controller");
  const input = req.body as CreateOrUpdateCompanyInput;
  const created = await companyService.createCompany(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: created },
    "Company"
  );
  logger.info("exiting::createCompany::controller");
  return res.status(201).json(response);
});

export const updateCompany = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCompany::controller");
  const input = req.body as CreateOrUpdateCompanyInput;
  const updated = await companyService.updateCompany(input);
  const response = BaseResponse.success(
    { type: "UPDATED", data: updated },
    "Company"
  );
  logger.info("exiting::createCompany::controller");
  return res.status(200).json(response);
});
