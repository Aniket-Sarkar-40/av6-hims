import {
  createStorageInDb,
  getAllStorageFromDb,
  getStorageByIdFromDb,
  updateStorageInDb,
} from "@/repository/master/storage.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
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
import {
  createStorageServicValidation,
  updateStorageServiceValiation,
} from "@/validations/service/master/storage.service.validation.js";
import { PmsStorage } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("STORAGE", "all");

export const storageService = {
  async createStorage(input: DropDownName) {
    logger.info("entering::createStorage::service");
    await createStorageServicValidation(input);
    const isCacheble = await checkIsCacheable(SHORT_CODE.STORAGE);
    const storage = await createStorageInDb(input);
    if (isCacheble && storage) {
      await addToCache(cacheKey, storage.id, storage);
    }
    logger.info("exiting::createStorage::service");
    return storage;
  },

  async updateStorage(input: DropDownName) {
    logger.info("entering::updateStorage::service");
    await updateStorageServiceValiation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    const storage = await updateStorageInDb(input);
    if (isCacheable && storage) {
      await updateCache(cacheKey, input.id!, storage);
    }
    logger.info("exiting::updateStorage::service");
    return storage;
  },

  async getStorageById(id: number, canNullReturnable: boolean = false) {
    logger.info("entering::getStorageById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    let storage: PmsStorage | null;
    if (isCacheable) {
      storage = (await getCacheById(cacheKey, id)) as PmsStorage | null;
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

  async getAllStorage() {
    logger.info("entering::getAllStorage::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.STORAGE);
    if (isCacheable) {
      const cachedStorage = (await getAllCache(cacheKey)) as Storage[] | null;
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
};
