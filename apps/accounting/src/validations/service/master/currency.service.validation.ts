import { validIdCheck } from "@/validations/global.validation.js";
import { Currency } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";

export const validateIdCurrency = async (id: number): Promise<Currency> => {
  logger.info("entering::validateIdCurrency::service::validation");
  validIdCheck(id);
  const currency = await currencyService.getCurrencyById(id);
  if (!currency) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Currency"));
  }
  logger.info("exiting::validateIdCurrency::service::validation");
  return currency;
};
