import {
  createStorageInDb,
  getAllStorageFromDb,
  getStorageByIdFromDb,
  updateStorageInDb,
} from "@/repository/master/storage.repository";
import { CreateOrUpdateStorage } from "@/types/master/storage";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache, getCacheById, updateCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import {
  createStorageServiceValidation,
  updateIdStorageServiceValidation,
} from "@/validations/service/master/storage.service.validation";
import { Storage } from "@prisma/client";

const cacheKey = getRedisKey("STORAGE", "all");

export const storageService = {
  async getStorageById(id: number, canNullReturnable: boolean = false): Promise<Storage | null> {
    logger.info("entering::getStorageById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    let storage: Storage | null;
    if (isCacheable) {
      storage = (await getCacheById(cacheKey, id)) as Storage | null;
    } else {
      storage = await getStorageByIdFromDb(id);
    }

    if (!storage) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
      else return null;
    }
    logger.info("exiting::getStorageById::service");
    return storage;
  },

  async getAllStorage(): Promise<Storage[]> {
    logger.info("entering::getAllStorage::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    if (isCacheable) {
      const cachedStorage = (await getAllCache(cacheKey)) as Storage[] | null;
      if (cachedStorage && cachedStorage.length > 0) {
        return cachedStorage;
      } else {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
      }
    } else {
      const storage = await getAllStorageFromDb();
      if (storage.length === 0) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
      }
      logger.info("exiting::getAllStorage::service");
      return storage;
    }
  },

  async createStorage(input: CreateOrUpdateStorage) {
    logger.info("entering::createStorage::service");
    await createStorageServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    const storage = await createStorageInDb(input);
    if (isCacheable && storage) {
      await addToCache(cacheKey, storage.id, storage);
    }
    logger.info("exiting::createStorage::service");
    return storage;
  },

  async updateStorage(input: CreateOrUpdateStorage) {
    logger.info("entering::updateStorage::service");

    await updateIdStorageServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    const updatedStorage = await updateStorageInDb(input);
    if (isCacheable && input.id) {
      await updateCache(cacheKey, input.id, updatedStorage);
    }

    logger.info("exiting::updateStorage::service");
    return updatedStorage;
  },
};
