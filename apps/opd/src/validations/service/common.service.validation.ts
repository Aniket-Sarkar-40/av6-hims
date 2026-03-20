import { shortCodeService } from "@/services/shortCode.service.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "../global.validation.js";

export const commonShortCodeServiceValidation = async (
  shortCode: string,
  id: number,
) => {
  logger.info(
    "entering::commonShortCodeServiceValidation::service::validation",
  );

  validIdCheck(id);

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Short Code"),
    );
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};
export const commonShortCodeCreateServiceValidation = async (
  shortCode: string,
) => {
  logger.info(
    "entering::commonShortCodeServiceValidation::service::validation",
  );

  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Short Code"),
    );
  }

  logger.info("exiting::commonShortCodeServiceValidation::service::validation");
  return shortCodeData;
};
