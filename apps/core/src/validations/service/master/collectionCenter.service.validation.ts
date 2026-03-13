import {
  getCollectionCenterByIdFromDb,
  getCollectionCenterByCollectionCenterNameFromDb,
  getCollectionCenterByConnectionCodeFromDb,
} from "@/repository/master/collectionCenter.repository.js";
import { CollectionCenterReq } from "@/types/master/collectionCenter.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdCollectionCenter = async (
  collectionCenterId: number
) => {
  logger.info("entering::validateIdCollectionCenter::service::validation");

  validIdCheck(collectionCenterId);

  const collectionCenter = await getCollectionCenterByIdFromDb(
    collectionCenterId
  );
  if (!collectionCenter || collectionCenter.isActive === "false") {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Collection Center")
    );
  }
  logger.info("exiting::validateIdCollectionCenter::service::validation");

  return collectionCenter;
};

export const deleteCollectionCenterServiceValidation = async (
  collectionCenterId: number
): Promise<void> => {
  logger.info(
    "entering::deleteCollectionCenterServiceValidation::service::validation"
  );

  await validateIdCollectionCenter(collectionCenterId);
  logger.info(
    "exiting::deleteCollectionCenterServiceValidation::service::validation"
  );

  return;
};

export const getIdCollectionCenterServiceValidation = async (
  collectionCenterId: number
): Promise<void> => {
  logger.info(
    "entering::getIdCollectionCenterServiceValidation::service::validation"
  );

  await validateIdCollectionCenter(collectionCenterId);
  logger.info(
    "exiting::getIdCollectionCenterServiceValidation::service::validation"
  );

  return;
};

export const updateIdCollectionCenterServiceValidation = async (
  collectionCenterId: number,
  body: CollectionCenterReq
): Promise<void> => {
  logger.info(
    "entering::updateIdCollectionCenterServiceValidation::service::validation"
  );
  await validateIdCollectionCenter(collectionCenterId);

  const collectionCenterByName =
    await getCollectionCenterByCollectionCenterNameFromDb(body.colName);
  if (
    collectionCenterByName &&
    collectionCenterByName.id !== collectionCenterId
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Collection Center Name")
    );
  }

  const collectionCenterByCode =
    await getCollectionCenterByConnectionCodeFromDb(body.connectionCode);
  if (
    collectionCenterByCode &&
    collectionCenterByCode.id !== collectionCenterId
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Connection Code")
    );
  }
  logger.info(
    "exiting::updateIdCollectionCenterServiceValidation::service::validation"
  );
  return;
};

export const createCollectionCenterServiceValidation = async (
  body: CollectionCenterReq
): Promise<void> => {
  logger.info(
    "entering::createCollectionCenterServiceValidation::service::validation"
  );
  // await validateCollectionCenterForeignKeys(body);
  const collectionCenter =
    await getCollectionCenterByCollectionCenterNameFromDb(body.colName);
  if (collectionCenter) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Collection Center Name")
    );
  }
  const collectionCenterByConnCode =
    await getCollectionCenterByConnectionCodeFromDb(body.connectionCode);
  if (collectionCenterByConnCode) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Connection Code")
    );
  }
  logger.info(
    "exiting::createCollectionCenterServiceValidation::service::validation"
  );

  return;
};
