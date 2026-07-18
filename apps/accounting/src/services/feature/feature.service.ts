import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  createFeatureFlagInDb,
  deleteFeatureFlagFromDb,
  getAllFeatureFlagsFromDb,
  getFeatureFlagByShortCodeFromDb,
  toggleFeatureFlagInDb,
  updateFeatureFlagInDb,
} from "@/repository/feature/feature.repository.js";
import {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@/types/feature/feature.js";

import {
  validateCreateFeatureFlag,
  validateIdFeatureFlag,
  validateUpdateFeatureFlag,
} from "@/validations/service/feature/feature.service.validation.js";
import { AccFeatureFlag } from "@repo/db/generated/prisma/client";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

const cacheKey = getRedisKey("FEATURE_FLAG", "all");

export const featureFlagService = {
  async createFeatureFlag(
    input: CreateFeatureFlagInput,
  ): Promise<AccFeatureFlag> {
    logger.info("entering::createFeatureFlag::service");
    await validateCreateFeatureFlag(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.FEATURE_FLAG);
    const created = await createFeatureFlagInDb(input);
    if (isCacheable && created) {
      await addToCache(cacheKey, created.shortCode, created);
    }
    logger.info("exiting::createFeatureFlag::service");
    return created;
  },

  async updateFeatureFlag(
    input: UpdateFeatureFlagInput,
  ): Promise<AccFeatureFlag> {
    logger.info("entering::updateFeatureFlag::service");
    await validateUpdateFeatureFlag(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.FEATURE_FLAG);
    const updated = await updateFeatureFlagInDb(input);
    if (isCacheable && updated) {
      await updateCache(cacheKey, updated.shortCode, updated);
    }
    logger.info("exiting::updateFeatureFlag::service");
    return updated;
  },

  async getAllFeatureFlags(): Promise<AccFeatureFlag[]> {
    logger.info("entering::getAllFeatureFlags::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.FEATURE_FLAG);
    if (isCacheable) {
      const cachedFeatures = (await getAllCache(cacheKey)) as
        | AccFeatureFlag[]
        | null;
      if (cachedFeatures && cachedFeatures.length > 0) {
        return cachedFeatures;
      }
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Feature Flags"),
      );
    } else {
      const records = await getAllFeatureFlagsFromDb();
      if (!records || records.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Feature Flags"),
        );
      }
      logger.info("exiting::getAllFeatureFlags::service");
      return records;
    }
  },

  async getFeatureFlagByShortCode(
    shortCode: string,
    canNullReturnable: boolean = false,
  ): Promise<AccFeatureFlag | null> {
    logger.info("entering::getFeatureFlagByName::service");
    let record: AccFeatureFlag | null = null;
    const isCacheable = await checkIsCacheable(SHORT_CODE.FEATURE_FLAG);
    if (isCacheable) {
      record = (await getCacheById(
        cacheKey,
        shortCode,
      )) as AccFeatureFlag | null;
    } else {
      record = await getFeatureFlagByShortCodeFromDb(shortCode);
    }

    if (!record) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Feature Flags"),
        );
      } else {
        return null;
      }
    }
    logger.info("exiting::getFeatureFlagByName::service");
    return record;
  },

  async toggleEnabled(id: number): Promise<AccFeatureFlag> {
    logger.info("entering::toggleEnabled::service");
    const existing = await validateIdFeatureFlag(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.FEATURE_FLAG);
    const updated = await toggleFeatureFlagInDb(id, existing);
    if (isCacheable && updated) {
      await updateCache(cacheKey, updated.shortCode, updated);
    }
    logger.info("exiting::toggleEnabled::service");
    return updated;
  },

  async deleteFeatureFlag(id: number): Promise<boolean> {
    logger.info("entering::deleteFeatureFlag::service");
    const existing = await validateIdFeatureFlag(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.FEATURE_FLAG);

    const isDeleted = await deleteFeatureFlagFromDb(id);
    if (isCacheable && isDeleted) {
      await deleteCache(cacheKey, existing.shortCode);
    }

    logger.info("exiting::deleteFeatureFlag::service");
    return isDeleted;
  },
};
