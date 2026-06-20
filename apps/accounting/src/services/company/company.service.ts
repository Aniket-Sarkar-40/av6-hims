import { auditProxy } from "@/config/audit.config.js";
import {
  createCompanyInDb,
  updateCompanyInDb,
} from "@/repository/company/company.repository.js";
import { CreateOrUpdateCompanyInput } from "@/types/company/company.js";
import { createOrUpdateCompanyServiceValidation } from "@/validations/service/company/company.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

const companyServiceRaw = {
  async createCompany(input: CreateOrUpdateCompanyInput): Promise<void> {
    logger.info("entering::createCompany::service");
    await createOrUpdateCompanyServiceValidation(input);
    await createCompanyInDb(input);
    logger.info("exiting::createCompany::service");
  },
  async updateCompany(input: CreateOrUpdateCompanyInput): Promise<void> {
    logger.info("entering::updateCompany::service");
    await createOrUpdateCompanyServiceValidation(input);
    await updateCompanyInDb(input);
    logger.info("exiting::updateCompany::service");
  },
};

export const companyService = auditProxy.createAuditedService(
  "company",
  companyServiceRaw
);
