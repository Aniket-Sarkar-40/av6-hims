// import db from "@/db/client.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { UpdateConfigByCodeInput } from "av6-core-v2";
import { shortCodeService } from "@/services/shortCode.service.js";

export const commonShortCodeServiceValidation = async (
  shortCode: string,
  id: number
) => {
  logger.info(
    "entering::commonShortCodeServiceValidation::service::validation"
  );

  validIdCheck(id);

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Short Code")
    );
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};

export const commonShortCodeCreateServiceValidation = async (
  shortCode: string
) => {
  logger.info(
    "entering::commonShortCodeServiceValidation::service::validation"
  );

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Short Code")
    );
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};

export const validateUpdateDynamicShortCodeConfig = async (
  input: UpdateConfigByCodeInput
) => {
  logger.info(
    "entering::validateUpdateDynamicShortCodeConfig::service::validation"
  );

  const existing = await commonShortCodeCreateServiceValidation(
    input.shortCode
  );

  input.existing = existing;
  logger.info(
    "exiting::validateUpdateDynamicShortCodeConfig::service::validation"
  );
};
