import { auditProxy } from "@/config/audit.config.js";
import {
  closeCompanyFinancialYearInDb,
  createCompanyFinancialYearInDb,
  toggleLockCompanyFinancialYearInDb,
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
  async closeCompanyFinancialYear(id: number) {
    logger.info("entering::closeCompanyFinancialYear::service");
    await validateCloseCompanyFinancialYearServiceValidation(id);
    await closeCompanyFinancialYearInDb(id);
    logger.info("exiting::closeCompanyFinancialYear::service");
  },
  async toggleLockCompanyFinancialYear(id: number) {
    logger.info("entering::toggleLockCompanyFinancialYear::service");
    const status =
      await validateToggleLockCompanyFinancialYearServiceValidation(id);
    const updated = await toggleLockCompanyFinancialYearInDb({ id, status });
    logger.info("exiting::toggleLockCompanyFinancialYear::service");
    return updated;
  },
};

export const companyFinancialYearService = auditProxy.createAuditedService(
  "companyFinancialYear",
  CompanyFinancialYearServiceRaw
);
