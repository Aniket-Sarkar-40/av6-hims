import { validIdCheck } from "@/validations/global.validation.js";
import { getPmsDistributorById } from "@/repository/pmsDistributor/pmsDistributor.repository.js";
import { Distributor } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdPmsDistributor = async (
  id: number
): Promise<Distributor> => {
  logger.info("entering::validateIdPmsDistributor::service");
  validIdCheck(id);
  const distributor = await getPmsDistributorById(id);
  if (!distributor) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "PharmacyDistributor")
    );
  }
  logger.info("exiting::validateIdPmsDistributor::service");
  return distributor;
};
