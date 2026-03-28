import {
  getStorageByIdFromDb,
  getStorageByStorageNameFromDb,
} from "@/repository/master/storage.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdStorage = async (storageId: number) => {
  logger.info("entering::validateIdStorage::service::validation");

  validIdCheck(storageId);

  const storage = await getStorageByIdFromDb(storageId);
  if (!storage) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
  }
  logger.info("exiting::validateIdStorage::service::validation");

  return storage;
};

export const createStorageServicValidation = async (input: DropDownName) => {
  logger.info("entering::createStorage::service::validation");
  const { name } = input;
  const storage = await getStorageByStorageNameFromDb(name);
  if (storage?.name === name) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Storage"),
    );
  }
  logger.info("exiting::createStorage::service::validation");
};

export const updateStorageServiceValiation = async (input: DropDownName) => {
  logger.info("entering::updateStorage::service::validation");
  if (!input.id) {
    throw new ErrorHandler(400, "ID is required for updating storage");
  }

  await validateIdStorage(input.id);
  const storage = await getStorageByStorageNameFromDb(input.name);
  if (storage && storage.id !== input.id)
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Storage"),
    );
  logger.info("exiting::updateStorage::service::validation");
};
