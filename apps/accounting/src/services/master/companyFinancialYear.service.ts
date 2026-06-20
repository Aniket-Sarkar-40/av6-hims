import { auditProxy } from "@/config/audit.config.js";
import {
  createCompanyFinancialYearInDb,
  updateCompanyFinancialYearInDb,
} from "@/repository/master/companyFinancialYear.repository.js";
import { CreateOrUpdateCompanyFinancialYear } from "@/types/master/companyFinancialYear.js";
import { createOrUpdateCompanyFinancialYearServiceValidation } from "@/validations/service/master/companyFinancialYear.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

const CompanyFinancialYearServiceRaw = {
  async createCompanyFinancialYear(input: CreateOrUpdateCompanyFinancialYear) {
    logger.info("entering::createCompanyFinancialYear::service");
    await createOrUpdateCompanyFinancialYearServiceValidation(input);
    const createdCompanyFinancialYear = await createCompanyFinancialYearInDb(
      input
    );
    logger.info("exiting::createCompanyFinancialYear::service");
    return createdCompanyFinancialYear;
  },
  async updateCompanyFinancialYear(input: CreateOrUpdateCompanyFinancialYear) {
    logger.info("entering::updateCompanyFinancialYear::service");
    await createOrUpdateCompanyFinancialYearServiceValidation(input);
    const updatedCompanyFinancialYear = await updateCompanyFinancialYearInDb(
      input
    );
    logger.info("exiting::updateCompanyFinancialYear::service");
    return updatedCompanyFinancialYear;
  },
};

export const companyFinancialYearService = auditProxy.createAuditedService(
  "companyFinancialYear",
  CompanyFinancialYearServiceRaw
);
