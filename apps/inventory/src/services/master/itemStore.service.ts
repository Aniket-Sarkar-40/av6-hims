import { toItemStoreDTO } from "@/mapper/master/itemStore.mapper.js";
import {
  createItemStoreInDb,
  getAllItemStoreFromDb,
  getItemStoreByIdFromDb,
  updateItemStoreInDb,
} from "@/repository/master/itemStore.repository.js";
import {
  ItemStoreDTO,
  ItemStoreReq,
  ItemStoreUpdate,
} from "@/types/master/itemStore.js";
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
  createItemStoreServiceValidation,
  updateIdItemStoreServiceValidation,
} from "@/validations/service/master/itemStore.service.validation.js";
import { InvItemStore } from "@repo/db/generated/prisma/client";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("ITEM_STORE", "all");

export const itemStoreService = {
  async createItemStore(input: ItemStoreReq): Promise<ItemStoreDTO> {
    logger.info("entering::createItemStore::service");
    await createItemStoreServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    const itemStore = await createItemStoreInDb(input);
    if (isCacheable && itemStore) {
      await addToCache(cacheKey, itemStore.id, itemStore);
    }
    logger.info("exiting::createItemStore::service");
    const itemStoreDTO = await toItemStoreDTO([itemStore]);
    return itemStoreDTO[0];
  },

  async updateItemStore(input: ItemStoreUpdate): Promise<ItemStoreDTO> {
    logger.info("entering::updateItemStore::service");
    if (!input.id) {
      throw new ErrorHandler(400, "Item Store ID is required");
    }
    await updateIdItemStoreServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    const updatedItemStore = await updateItemStoreInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedItemStore);
    }

    logger.info("exiting::updateItemStore::service");
    const itemStoreDTO = await toItemStoreDTO([updatedItemStore]);
    return itemStoreDTO[0];
  },
  async getAllItemStore(
    canNullReturnable: boolean = false
  ): Promise<ItemStoreDTO[]> {
    logger.info("entering::getAllItemStore::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    let itemStore: InvItemStore[];
    if (isCacheable) {
      itemStore = (await getAllCache(cacheKey)) as InvItemStore[];
    } else {
      itemStore = await getAllItemStoreFromDb();
    }
    logger.info("exiting::getAllItemStore::service");
    if (itemStore.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Store")
        );
      else return [];
    }
    return await toItemStoreDTO(itemStore);
  },

  async getItemStoreById(
    itemStoreId: number,
    canNullReturnable: boolean = false
  ): Promise<ItemStoreDTO | null> {
    logger.info("entering::getItemStoreById::service");
    validIdCheck(itemStoreId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    let itemStore: InvItemStore | null;
    if (isCacheable) {
      itemStore = (await getCacheById(
        cacheKey,
        itemStoreId
      )) as InvItemStore | null;
    } else {
      itemStore = await getItemStoreByIdFromDb(itemStoreId);
    }
    if (!itemStore) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Store")
        );
      else return null;
    }

    logger.info("exiting::getItemStoreById::service");
    const itemStoreDTO = await toItemStoreDTO([itemStore]);
    return itemStoreDTO[0];
  },

  async getItemStoreByIdFromCache(
    itemStoreId: number,
    canNullReturnable: boolean = false
  ): Promise<ItemStoreDTO | null> {
    logger.info("entering::getItemStoreByIdFromCache::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    if (!isCacheable)
      throw new ErrorHandler(400, "Cache disable for item store");
    validIdCheck(itemStoreId);
    const itemStore = (await getCacheById(
      cacheKey,
      itemStoreId
    )) as InvItemStore | null;
    if (!itemStore) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Store")
        );
      else return null;
    }

    logger.info("exiting::getItemStoreByIdFromCache::service");
    const itemStoreDTO = await toItemStoreDTO([itemStore]);
    return itemStoreDTO[0];
  },
  async getAllItemStoreFromCache(): Promise<ItemStoreDTO[]> {
    logger.info("entering::getAllItemStoreFromCache::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    if (!isCacheable)
      throw new ErrorHandler(400, "Cache disable for item store");
    const cachedItemStore = (await getAllCache(cacheKey)) as InvItemStore[];

    logger.info("exiting::getAllItemStoreFromCache::service");
    return await toItemStoreDTO(cachedItemStore);
  },

  async getAllItemStoreWoDto(
    canNullReturnable: boolean = false
  ): Promise<InvItemStore[]> {
    logger.info("entering::getAllItemStoreWoDto::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    let itemStore: InvItemStore[];
    if (isCacheable) {
      itemStore = (await getAllCache(cacheKey)) as InvItemStore[];
    } else {
      itemStore = await getAllItemStoreFromDb();
    }
    logger.info("exiting::getAllItemStoreWoDto::service");
    if (itemStore.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Store")
        );
      else return [];
    }
    return itemStore;
  },
};
