import { validIdCheck } from "@/validations/global.validation.js";
import { getCorporateByIdFromDb } from "@/repository/clientMaster/corporate.repository.js";
import { ClientMaster } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdClientMaster = async (
  id: number,
): Promise<ClientMaster> => {
  logger.info("entering::validateIdClientMaster::service::validation");
  validIdCheck(id);
  const client = await getCorporateByIdFromDb(id);
  if (!client) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Client Master"),
    );
  }
  logger.info("exiting::validateIdClientMaster::service::validation");
  return client;
};
