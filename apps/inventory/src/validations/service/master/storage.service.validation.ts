import { getStorageByStorageNameFromDb } from "@/repository/master/storage.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { storageService } from "@/services/master/storage.service.js";
import { CreateOrUpdateStorage } from "@/types/master/storage.js";

export const validateIdStorage = async (storageId: number) => {
  logger.info("entering::validateIdStorage::service::validation");

  validIdCheck(storageId);

  const storage = await storageService.getStorageById(storageId, true);
  if (!storage) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
  }
  logger.info("exiting::validateIdStorage::service::validation");

  return storage;
};

export const updateIdStorageServiceValidation = async (
  body: CreateOrUpdateStorage,
) => {
  logger.info(
    "entering::updateIdStorageServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdStorage(body.id);
  }

  const storageByName = await getStorageByStorageNameFromDb(body.name);
  if (storageByName && storageByName.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Storage Name"),
    );
  }
  logger.info("exiting::updateIdStorageServiceValidation::service::validation");
  return;
};

export const createStorageServiceValidation = async (
  body: CreateOrUpdateStorage,
) => {
  logger.info("entering::createStorageServiceValidation::service::validation");
  const storageByName = await getStorageByStorageNameFromDb(body.name);
  if (storageByName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Storage Name"),
    );
  }
  logger.info("exiting::createStorageServiceValidation::service::validation");
  return;
};
