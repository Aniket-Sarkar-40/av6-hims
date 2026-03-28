import { toStoreDTO } from "@/mapper/master/store.mapper.js";
import {
  createStoreInDb,
  getAllStoreFromDb,
  getStoreByIdFromDb,
  updateStoreInDb,
} from "@/repository/master/store.repository.js";
import {
  StoreCreateInput,
  storeDTO,
  StoreUpdateInput,
} from "@/types/master/store.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createStoreServiceValidation,
  updateStoreServiceValidation,
} from "@/validations/service/master/store.service.validation.js";
import { Store } from "@repo/db/generated/prisma/client";
const cacheKey = getRedisKey("STORE", "all");

export const storeService = {
  async createStore(input: StoreCreateInput): Promise<storeDTO> {
    logger.info("entering::createStore::service");
    await createStoreServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORE);

    const store = await createStoreInDb(input);
    if (isCacheable && store) {
      await addToCache(cacheKey, store.id, store);
    }

    const storeDTO = await toStoreDTO(store);
    logger.info("exiting::createStore::service");
    return storeDTO;
  },

  async updateStore(input: StoreUpdateInput): Promise<storeDTO> {
    logger.info("entering::updateStore::service");
    await updateStoreServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORE);

    const updatedStore = await updateStoreInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, updatedStore.id, updatedStore);
    }

    const storeDTO = await toStoreDTO(updatedStore);

    logger.info("exiting::updateStore::service");
    return storeDTO;
  },

  async getAllStore(): Promise<storeDTO[]> {
    logger.info("entering::getAllStore::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORE);
    if (isCacheable) {
      const allStore = (await getAllCache(cacheKey)) as Store[] | null;
      if (allStore && allStore.length > 0) {
        logger.info("exiting::getAllStore::service");
        const storeDTOs = await Promise.all(
          allStore.map((store) => toStoreDTO(store)),
        );
        return storeDTOs;
      } else {
        logger.info("exiting::getAllStore::service");
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store"));
      }
    } else {
      const allStore = await getAllStoreFromDb();
      if (allStore && allStore.length > 0) {
        logger.info("exiting::getAllStore::service");
        const storeDTOs = await Promise.all(
          allStore.map((store) => toStoreDTO(store)),
        );
        return storeDTOs;
      } else {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store"));
      }
    }
  },

  async getStoreById(
    storeId: number,
    canNullReturnable: boolean = false,
  ): Promise<storeDTO | null> {
    logger.info("entering::getStoreById::service");
    validIdCheck(storeId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORE);
    let store: Store | null;
    if (isCacheable) {
      store = (await getCacheById(cacheKey, storeId)) as Store | null;
    } else {
      store = await getStoreByIdFromDb(storeId);
    }
    if (!store) {
      if (!canNullReturnable)
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store"));
      else return null;
    }

    logger.info("exiting::getStoreById::service");
    const storeDTO = await toStoreDTO(store);
    return storeDTO;
  },
};
