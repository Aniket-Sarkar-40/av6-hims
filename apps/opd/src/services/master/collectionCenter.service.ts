import { getCollectionCenterByIdFromDb } from "@/repository/collectionCenter/collectionCenter.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const collectionCenterService = {
  async getCollectionCenterById(
    id: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getCollectionCenterById::service");
    const response = await getCollectionCenterByIdFromDb(id);
    logger.info("exiting::getCollectionCenterById::service");
    if (!response) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Collection Center"),
        );
      }
      return null;
    }
    return response;
  },
};
