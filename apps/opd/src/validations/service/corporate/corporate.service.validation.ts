import { getCorporateClientById } from "@/repository/corporate/corporate.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

export const validateIdCorporateClient = async (id: number) => {
  logger.info("entering::validateIdCorporateClient::service::validation");
  validIdCheck(id);
  const response = await getCorporateClientById(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Corporate Client"),
    );
  }
  logger.info("exiting::validateIdCorporateClient::service::validation");
  return response;
};
