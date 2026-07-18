import { getCollectionCenterByIdFromDb } from "@/repository/master/collectionCenter.repository.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { CollectionCenter } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdCollectionCenter = async (
  id: number,
): Promise<CollectionCenter> => {
  logger.info("entering::validateIdCollectionCenter::service::validation");
  validIdCheck(id);

  const cc = await getCollectionCenterByIdFromDb(id);

  if (!cc) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Collection Center"),
    );
  }
  logger.info("exiting::validateIdCollectionCenter::service::validation");
  return cc;
};
