import {
  createItemCategoryInDb,
  getAllItemCategoryFromDb,
  getItemCategoryByIdFromDb,
  updateItemCategoryInDb,
} from "@/repository/master/itemCategory.repository";
import { ItemCategoryReq, ItemCategoryUpdate } from "@/types/master/itemCategory";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache, getCacheById, updateCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { validIdCheck } from "@/validations/global.validation";
import {
  createItemCategoryServiceValidation,
  updateIdItemCategoryServiceValidation,
} from "@/validations/service/master/itemCategory.service.validation";
import { ItemCategory } from "@prisma/client";

const cacheKey = getRedisKey("ITEM_CATEGORY", "all");

export const itemCategoryService = {
  async createItemCategory(input: ItemCategoryReq): Promise<ItemCategory> {
    logger.info("entering::createItemCategory::service");
    await createItemCategoryServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_CATEGORY);
    const itemCategory = await createItemCategoryInDb(input);
    if (isCacheable && itemCategory) {
      await addToCache(cacheKey, itemCategory.id, itemCategory);
    }
    logger.info("exiting::createItemCategory::service");
    return itemCategory;
  },

  async updateItemCategory(input: ItemCategoryUpdate): Promise<ItemCategory> {
    logger.info("entering::updateItemCategory::service");
    if (!input.id) {
      throw new ErrorHandler(400, "Item Category ID is required");
    }
    await updateIdItemCategoryServiceValidation(input.id, input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_CATEGORY);
    const updatedItemCategory = await updateItemCategoryInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedItemCategory);
    }

    logger.info("exiting::updateItemCategory::service");
    return updatedItemCategory;
  },

  async getAllItemCategory(canNullReturnable: boolean = false): Promise<ItemCategory[]> {
    logger.info("entering::getAllItemCategory::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_CATEGORY);
    let itemCategory: ItemCategory[];
    if (isCacheable) {
      itemCategory = (await getAllCache(cacheKey)) as ItemCategory[];
    } else {
      itemCategory = await getAllItemCategoryFromDb();
    }
    if (itemCategory.length === 0) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Category"));
      else return [];
    }
    logger.info("exiting::getAllCollectionCenter::service");
    return itemCategory;
  },

  async getItemCategoryById(itemCategoryId: number, canNullReturnable: boolean = false): Promise<ItemCategory | null> {
    logger.info("entering::getItemCategoryById::service");
    validIdCheck(itemCategoryId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_CATEGORY);
    let itemCategory: ItemCategory | null;
    if (isCacheable) {
      itemCategory = (await getCacheById(cacheKey, itemCategoryId)) as ItemCategory | null;
    } else {
      itemCategory = await getItemCategoryByIdFromDb(itemCategoryId);
    }
    if (!itemCategory) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Category"));
      else return null;
    }

    logger.info("exiting::getItemCategoryById::service");
    return itemCategory;
  },
};
