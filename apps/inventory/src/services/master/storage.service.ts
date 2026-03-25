import {
  createStorageInDb,
  getAllStorageFromDb,
  getStorageByIdFromDb,
  updateStorageInDb,
} from "@/repository/master/storage.repository.js";
import { CreateOrUpdateStorage } from "@/types/master/storage.js";
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
import {
  createStorageServiceValidation,
  updateIdStorageServiceValidation,
} from "@/validations/service/master/storage.service.validation.js";
import { InvStorage } from "@repo/db/generated/prisma/client";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("STORAGE", "all");

export const storageService = {
  async getStorageById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<InvStorage | null> {
    logger.info("entering::getStorageById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    let storage: InvStorage | null;
    if (isCacheable) {
      storage = (await getCacheById(cacheKey, id)) as InvStorage | null;
    } else {
      storage = await getStorageByIdFromDb(id);
    }

    if (!storage) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Storage"),
        );
      else return null;
    }
    logger.info("exiting::getStorageById::service");
    return storage;
  },

  async getAllStorage(): Promise<InvStorage[]> {
    logger.info("entering::getAllStorage::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    if (isCacheable) {
      const cachedStorage = (await getAllCache(cacheKey)) as
        | InvStorage[]
        | null;
      if (cachedStorage && cachedStorage.length > 0) {
        return cachedStorage;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Storage"),
        );
      }
    } else {
      const storage = await getAllStorageFromDb();
      if (storage.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Storage"),
        );
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
