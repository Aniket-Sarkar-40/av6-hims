import { getCollectionCenterByIdFromDb } from "@/repository/master/collectionCenter.repository";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";

export const validateIdCollectionCenter = async (collectionCenterId: number) => {
  logger.info("entering::validateIdCollectionCenter::service::validation");

  validIdCheck(collectionCenterId);

  const collectionCenter = await getCollectionCenterByIdFromDb(collectionCenterId);
  if (!collectionCenter) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Collection Center"));
  }
  logger.info("exiting::validateIdCollectionCenter::service::validation");

  return collectionCenter;
};
