import { getItemCategoryByItemCategoryNameFromDb } from "@/repository/master/itemCategory.repository.js";
import { itemCategoryService } from "@/services/master/itemCategory.service.js";
import {
  ItemCategoryReq,
  ItemCategoryUpdate,
} from "@/types/master/itemCategory.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdItemCategory = async (itemCategoryId: number) => {
  logger.info("entering::validateIdItemCategory::service::validation");

  validIdCheck(itemCategoryId);

  const itemCategory = await itemCategoryService.getItemCategoryById(
    itemCategoryId,
    true,
  );
  if (!itemCategory) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Category"),
    );
  }
  logger.info("exiting::validateIdItemCategory::service::validation");

  return itemCategory;
};

export const updateIdItemCategoryServiceValidation = async (
  itemCategoryId: number,
  body: ItemCategoryUpdate,
): Promise<void> => {
  logger.info("entering::updateIdItemCategory::service::validation");
  await validateIdItemCategory(itemCategoryId);

  const itemCategoryByName = await getItemCategoryByItemCategoryNameFromDb(
    String(body.name),
  );
  if (itemCategoryByName && itemCategoryByName.id !== itemCategoryId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Category Name"),
    );
  }

  logger.info("exiting::updateIdItemCategory::service::validation");
  return;
};

export const createItemCategoryServiceValidation = async (
  body: ItemCategoryReq,
): Promise<void> => {
  logger.info("entering::createItemCategory::service::validation");
  const itemCategory = await getItemCategoryByItemCategoryNameFromDb(
    String(body.name),
  );
  if (itemCategory) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Category Name"),
    );
  }
  logger.info("exiting::createItemCategory::service::validation");

  return;
};
