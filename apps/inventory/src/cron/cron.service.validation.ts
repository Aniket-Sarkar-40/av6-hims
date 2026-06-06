import { validateIdCronDetails } from "@/cron/cronDetails.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const reRunTaskInstanceCronServiceValidation = async (
  cronDetailsId: number
) => {
  logger.info("entering::runTaskInstanceCron::serviceValidation");
  const cronDetails = await validateIdCronDetails(cronDetailsId);
  if (cronDetails.status !== "FAILED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Cron Details")
    );
  }
  if (cronDetails.cronName !== "taskInstanceCron") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Cron Details")
    );
  }

  logger.info("exiting::runTaskInstanceCron::serviceValidation");
  return cronDetails;
};
export const reRunfineAndBonusCronServiceValidation = async (
  cronDetailsId: number
) => {
  logger.info("entering::reRunfineAndBonusCron::serviceValidation");
  const cronDetails = await validateIdCronDetails(cronDetailsId);
  if (cronDetails.status !== "FAILED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Cron Details")
    );
  }
  if (!cronDetails.cronName.startsWith("fineBonusCron")) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Cron Details")
    );
  }

  logger.info("exiting::reRunfineAndBonusCron::serviceValidation");
  return cronDetails;
};
