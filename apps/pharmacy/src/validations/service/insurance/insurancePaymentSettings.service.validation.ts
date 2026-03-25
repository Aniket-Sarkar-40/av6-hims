import { logger } from "@repo/platform/logging/logger.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateIdInsurance } from "./insurance.service.validation.js";

export const insurancePaymentSettingsServiceValidation = async (
  insuranceId?: number | "all",
  ccId?: number | "all",
) => {
  logger.info(
    "entering::insurancePaymentSettingsServiceValidation::service::validation",
  );

  if (ccId !== undefined && ccId !== "all") {
    await validateIdBranch(ccId);
  }
  if (insuranceId !== undefined && insuranceId !== "all") {
    await validateIdInsurance(insuranceId);
  }

  logger.info(
    "exiting::insurancePaymentSettingsServiceValidation::service::validation",
  );
};
