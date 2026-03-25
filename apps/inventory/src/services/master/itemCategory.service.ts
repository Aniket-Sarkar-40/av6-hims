import {
  createItemCategoryInDb,
  getAllItemCategoryFromDb,
  getItemCategoryByIdFromDb,
  updateItemCategoryInDb,
} from "@/repository/master/itemCategory.repository.js";
import {
  ItemCategoryReq,
  ItemCategoryUpdate,
} from "@/types/master/itemCategory.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createItemCategoryServiceValidation,
  updateIdItemCategoryServiceValidation,
} from "@/validations/service/master/itemCategory.service.validation.js";
import { InvItemCategory } from "@repo/db/generated/prisma/client";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("ITEM_CATEGORY", "all");

export const itemCategoryService = {
  async createItemCategory(input: ItemCategoryReq): Promise<InvItemCategory> {
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

  async updateItemCategory(
    input: ItemCategoryUpdate,
  ): Promise<InvItemCategory> {
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

  async getAllItemCategory(
    canNullReturnable: boolean = false,
  ): Promise<InvItemCategory[]> {
    logger.info("entering::getAllItemCategory::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_CATEGORY);
    let itemCategory: InvItemCategory[];
    if (isCacheable) {
      itemCategory = (await getAllCache(cacheKey)) as InvItemCategory[];
    } else {
      itemCategory = await getAllItemCategoryFromDb();
    }
    if (itemCategory.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Category"),
        );
      else return [];
    }
    logger.info("exiting::getAllCollectionCenter::service");
    return itemCategory;
  },

  async getItemCategoryById(
    itemCategoryId: number,
    canNullReturnable: boolean = false,
  ): Promise<InvItemCategory | null> {
    logger.info("entering::getItemCategoryById::service");
    validIdCheck(itemCategoryId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_CATEGORY);
    let itemCategory: InvItemCategory | null;
    if (isCacheable) {
      itemCategory = (await getCacheById(
        cacheKey,
        itemCategoryId,
      )) as InvItemCategory | null;
    } else {
      itemCategory = await getItemCategoryByIdFromDb(itemCategoryId);
    }
    if (!itemCategory) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Category"),
        );
      else return null;
    }

    logger.info("exiting::getItemCategoryById::service");
    return itemCategory;
  },
};
