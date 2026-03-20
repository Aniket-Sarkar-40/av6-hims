import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

import { getCollectionCenterByIdFromDb } from "@/repository/collectionCenter/collectionCenter.repository.js";

export const validateIdCollectionCenter = async (id: number) => {
  logger.info("entering::validateIdCollectionCenter::service::validation");
  validIdCheck(id);
  const collectionCenter = await getCollectionCenterByIdFromDb(id);
  if (!collectionCenter) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Collection Center"),
    );
  }
  logger.info("exiting::validateIdCollectionCenter::service::validation");
  return collectionCenter;
};
