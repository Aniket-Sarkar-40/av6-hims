import { toGeneralBillingDto } from "@/mapper/appointment/generalBilling.mapper.js";
import {
  createGeneralBillingInDb,
  deleteGeneralBillingFromDb,
  returnGeneralBillingInDb,
  updateGeneralBillingInDb,
} from "@/repository/appointment/generalBilling.repository.js";
import {
  GeneralBillingCreateInput,
  GeneralBillingDto,
  GeneralBillingReturnInput,
  GeneralBillingUpdateInput,
} from "@/types/appointment/generalBilling.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createGeneralBillingServiceValidation,
  returnGeneralBillingServiceValidation,
  updateGeneralBillingServiceValidation,
  validateIdGeneralBilling,
} from "@/validations/service/appointment/generalBilling.service.validation.js";

export const generalBillingService = {
  async createGeneralBilling(
    input: GeneralBillingCreateInput,
  ): Promise<GeneralBillingDto> {
    logger.info("entering::createGeneralBilling::service");
    await createGeneralBillingServiceValidation(input);
    const response = await createGeneralBillingInDb(input);
    logger.info("exiting::createGeneralBilling::service");
    return toGeneralBillingDto(response);
  },

  async updateGeneralBilling(
    input: GeneralBillingUpdateInput,
  ): Promise<GeneralBillingDto> {
    logger.info("entering::updateGeneralBilling::service");
    await updateGeneralBillingServiceValidation(input);
    const response = await updateGeneralBillingInDb(input);
    logger.info("exiting::updateGeneralBilling::service");
    return toGeneralBillingDto(response);
  },

  async deleteGeneralBilling(id: number): Promise<void> {
    logger.info("entering::deleteGeneralBilling::service");
    await validateIdGeneralBilling(id);
    await deleteGeneralBillingFromDb(id);
    logger.info("exiting::deleteGeneralBilling::service");
  },

  async returnGeneralBilling(
    input: GeneralBillingReturnInput,
  ): Promise<GeneralBillingDto> {
    logger.info("entering::returnGeneralBilling::service");
    await returnGeneralBillingServiceValidation(input);
    const response = await returnGeneralBillingInDb(input);
    logger.info("exiting::returnGeneralBilling::service");
    return toGeneralBillingDto(response);
  },
};
