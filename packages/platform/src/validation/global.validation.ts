import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validIdCheck = (id: number): void => {
  logger.info(`entering::validIdCheck id::${id}`);
  if (
    isNaN(id) ||
    !isFinite(id) ||
    id > Number.MAX_SAFE_INTEGER ||
    id < 1 ||
    !Number.isInteger(id)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", id.toString())
    );
  }
  logger.info(`exiting::validIdCheck id::${id}`);
  return;
};
