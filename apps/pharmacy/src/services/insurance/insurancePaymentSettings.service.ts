import { toInsurancePaymentSettingsDto } from "@/mapper/insurance/insurancePaymentSettings.mapper.js";
import { getInsurancePaymentSettingsByFilterFromDb } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import { InsurancePaymentSettingsDTO } from "@/types/insurance/insurancePaymentSettings.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
// import { insurancePaymentSettingsServiceValidation } from "@/validations/service/insurance/insurancePaymentSettings.service.validation.js";

export const insurancePaymentSettingsService = {
  async getInsurancePaymentSettingsByFilter(
    insuranceId?: number | "all",
    ccId?: number | "all",
    medId?: number,
  ): Promise<InsurancePaymentSettingsDTO[]> {
    logger.info("entering::getInsurancePaymentSettingsByFilter::service");

    // await insurancePaymentSettingsServiceValidation(insuranceId, ccId);
    const records = await getInsurancePaymentSettingsByFilterFromDb(
      insuranceId,
      ccId,
      medId,
    );
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Insurance Payment Settings"),
      );
    }
    logger.info("exiting::getInsurancePaymentSettingsByFilter::service");
    return Promise.all(records.map(toInsurancePaymentSettingsDto));
  },
};
