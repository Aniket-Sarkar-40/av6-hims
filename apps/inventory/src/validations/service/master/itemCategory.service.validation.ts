import { getItemCategoryByItemCategoryNameFromDb } from "@/repository/master/itemCategory.repository";
import { itemCategoryService } from "@/services/master/itemCategory.service";
import { ItemCategoryReq, ItemCategoryUpdate } from "@/types/master/itemCategory";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";

export const validateIdItemCategory = async (itemCategoryId: number) => {
  logger.info("entering::validateIdItemCategory::service::validation");

  validIdCheck(itemCategoryId);

  const itemCategory = await itemCategoryService.getItemCategoryById(itemCategoryId, true);
  if (!itemCategory) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Category"));
  }
  logger.info("exiting::validateIdItemCategory::service::validation");

  return itemCategory;
};

export const updateIdItemCategoryServiceValidation = async (
  itemCategoryId: number,
  body: ItemCategoryUpdate
): Promise<void> => {
  logger.info("entering::updateIdItemCategory::service::validation");
  await validateIdItemCategory(itemCategoryId);

  const itemCategoryByName = await getItemCategoryByItemCategoryNameFromDb(String(body.name));
  if (itemCategoryByName && itemCategoryByName.id !== itemCategoryId) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Category Name"));
  }

  logger.info("exiting::updateIdItemCategory::service::validation");
  return;
};

export const createItemCategoryServiceValidation = async (body: ItemCategoryReq): Promise<void> => {
  logger.info("entering::createItemCategory::service::validation");
  const itemCategory = await getItemCategoryByItemCategoryNameFromDb(String(body.name));
  if (itemCategory) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Category Name"));
  }
  logger.info("exiting::createItemCategory::service::validation");

  return;
};
