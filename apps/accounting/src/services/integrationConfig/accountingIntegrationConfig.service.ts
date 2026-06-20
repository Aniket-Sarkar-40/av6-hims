import { auditProxy } from "@/config/audit.config.js";
import {
  createAccountingIntegrationConfigInDb,
  updateAccountingIntegrationConfigInDb,
} from "@/repository/integrationConfig/accountingIntegrationConfig.repository.js";
import { CreateOrUpdateAccountingIntegrationConfigInput } from "@/types/integrationConfig/accountingIntegrationConfig.js";

import { validateCreateOrUpdateAccountingIntegrationConfig } from "@/validations/service/integrationConfig/accountingIntegrationConfig.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

const accountingIntegrationConfigServiceRaw = {
  async createAccountingIntegrationConfig(
    input: CreateOrUpdateAccountingIntegrationConfigInput
  ) {
    logger.info("entering::createAccountingIntegrationConfig::service");
    await validateCreateOrUpdateAccountingIntegrationConfig(input);
    const createdDate = await createAccountingIntegrationConfigInDb(input);
    logger.info("exiting::createAccountingIntegrationConfig::service");
    return createdDate;
  },
  async updateAccountingIntegrationConfig(
    input: CreateOrUpdateAccountingIntegrationConfigInput
  ) {
    logger.info("entering::updateAccountingIntegrationConfig::service");
    await validateCreateOrUpdateAccountingIntegrationConfig(input);
    const updatedDate = await updateAccountingIntegrationConfigInDb(input);
    logger.info("exiting::updateAccountingIntegrationConfig::service");
    return updatedDate;
  },
};

export const accountingIntegrationConfigService =
  auditProxy.createAuditedService(
    "accountingIntegrationConfig",
    accountingIntegrationConfigServiceRaw
  );
