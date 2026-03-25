import { toAllItemStoreDTO, toItemStoreDTO } from "@/mapper/master/itemStore.mapper";
import {
  createItemStoreInDb,
  getAllItemStoreFromDb,
  getItemStoreByIdFromDb,
  updateItemStoreInDb,
} from "@/repository/master/itemStore.repository";
import { ItemStoreDTO, ItemStoreReq, ItemStoreUpdate } from "@/types/master/itemStore";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache, getCacheById, updateCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { validIdCheck } from "@/validations/global.validation";
import {
  createItemStoreServiceValidation,
  updateIdItemStoreServiceValidation,
} from "@/validations/service/master/itemStore.service.validation";
import { ItemStore } from "@prisma/client";

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
    return await toItemStoreDTO(itemStore);
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
    return await toItemStoreDTO(updatedItemStore);
  },

  async getAllItemStore(canNullReturnable: boolean = false): Promise<ItemStoreDTO[]> {
    logger.info("entering::getAllItemStore::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    let itemStore: ItemStore[];
    if (isCacheable) {
      itemStore = (await getAllCache(cacheKey)) as ItemStore[];
    } else {
      itemStore = await getAllItemStoreFromDb();
    }
    logger.info("exiting::getAllItemStore::service");
    if (itemStore.length === 0) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Store"));
      else return [];
    }
    return await toAllItemStoreDTO(itemStore);
  },

  async getItemStoreById(itemStoreId: number, canNullReturnable: boolean = false): Promise<ItemStoreDTO | null> {
    logger.info("entering::getItemStoreById::service");
    validIdCheck(itemStoreId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    let itemStore: ItemStore | null;
    if (isCacheable) {
      itemStore = (await getCacheById(cacheKey, itemStoreId)) as ItemStore | null;
    } else {
      itemStore = await getItemStoreByIdFromDb(itemStoreId);
    }
    if (!itemStore) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Store"));
      else return null;
    }

    logger.info("exiting::getItemStoreById::service");
    return await toItemStoreDTO(itemStore);
  },

  async getItemStoreByIdFromCache(
    itemStoreId: number,
    canNullReturnable: boolean = false
  ): Promise<ItemStoreDTO | null> {
    logger.info("entering::getItemStoreByIdFromCache::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    if (!isCacheable) throw new ErrorHandler(400, "Cache disable for item store");
    validIdCheck(itemStoreId);
    const itemStore = (await getCacheById(cacheKey, itemStoreId)) as ItemStore | null;
    if (!itemStore) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Store"));
      else return null;
    }

    logger.info("exiting::getItemStoreByIdFromCache::service");
    return await toItemStoreDTO(itemStore);
  },
  async getAllItemStoreFromCache(): Promise<ItemStoreDTO[]> {
    logger.info("entering::getAllItemStoreFromCache::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_STORE);
    if (!isCacheable) throw new ErrorHandler(400, "Cache disable for item store");
    const cachedItemStore = (await getAllCache(cacheKey)) as ItemStore[];

    logger.info("exiting::getAllItemStoreFromCache::service");
    return await toAllItemStoreDTO(cachedItemStore);
  },
};
