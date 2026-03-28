import { getItemStoreByItemStoreNameFromDb } from "@/repository/master/itemStore.repository.js";
import { itemStoreService } from "@/services/master/itemStore.service.js";
import { ItemStoreReq, ItemStoreUpdate } from "@/types/master/itemStore.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdItemStore = async (itemStoreId: number) => {
  logger.info("entering::validateIdItemStore::service::validation");

  validIdCheck(itemStoreId);

  const itemStore = await itemStoreService.getItemStoreById(itemStoreId, true);
  if (!itemStore) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Store"),
    );
  }
  logger.info("exiting::validateIdItemStore::service::validation");

  return itemStore;
};

export const updateIdItemStoreServiceValidation = async (
  input: ItemStoreUpdate,
): Promise<void> => {
  logger.info("entering::updateIdItemStore::service::validation");
  await validateIdItemStore(input.id);
  const cc = await getBranchOrWarehouse(input.ccId);

  if (!cc) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Collection Center"),
    );
  }
  const itemStoreByName = await getItemStoreByItemStoreNameFromDb(
    input.itemStoreName,
  );
  if (itemStoreByName && itemStoreByName.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Store Name"),
    );
  }

  logger.info("exiting::updateIdItemStore::service::validation");
  return;
};

export const createItemStoreServiceValidation = async (
  body: ItemStoreReq,
): Promise<void> => {
  logger.info("entering::createItemStore::service::validation");
  const cc = await getBranchOrWarehouse(body.ccId);

  if (!cc) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Collection Center"),
    );
  }
  const itemStore = await getItemStoreByItemStoreNameFromDb(body.itemStoreName);
  if (itemStore) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Store Name"),
    );
  }
  logger.info("exiting::createItemStore::service::validation");

  return;
};
