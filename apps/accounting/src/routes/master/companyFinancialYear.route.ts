import {
  createCompanyFinancialYear,
  updateCompanyFinancialYear,
} from "@/controllers/master/companyFinancialYear.controller.js";
import {
  validateCreateCompanyFinancialYear,
  validateUpdateCompanyFinancialYear,
} from "@/validations/request/master/companyFinancialYear.validation.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const companyFinancialYearRouter: Router = Router();

companyFinancialYearRouter.post(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "COMPANY_FINANCIAL_YEAR", "CREATE")),
  validateCreateCompanyFinancialYear,
  createCompanyFinancialYear
);

companyFinancialYearRouter.put(
  "/",
  verifyToken,
  authorize(getPermission("ACC", "COMPANY_FINANCIAL_YEAR", "UPDATE")),
  validateUpdateCompanyFinancialYear,
  updateCompanyFinancialYear
);
