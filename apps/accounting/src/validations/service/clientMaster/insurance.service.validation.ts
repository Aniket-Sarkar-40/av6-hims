import { getInsuranceByIdFromDb } from "@/repository/clientMaster/insurance.repository.js";

import { validIdCheck } from "@/validations/global.validation.js";
import { InsuranceMaster } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdInsuranceMaster = async (
  id: number,
): Promise<InsuranceMaster> => {
  logger.info("entering::validateIdInsuranceMaster::service::validation");
  validIdCheck(id);
  const insurance = await getInsuranceByIdFromDb(id);
  if (!insurance) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Insurance Master"),
    );
  }
  logger.info("exiting::validateIdInsuranceMaster::service::validation");
  return insurance;
};
