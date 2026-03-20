import { getPathologyMasterByIdFromDb } from "@/repository/pathology/pathologyMaster.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

export const validateIdPathologyMaster = async (id: number) => {
  logger.info("entering::validateIdPathologyMaster::service::validation");
  validIdCheck(id);
  const response = await getPathologyMasterByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Pathology Master"),
    );
  }
  logger.info("exiting::validateIdPathologyMaster::service::validation");
  return response;
};
