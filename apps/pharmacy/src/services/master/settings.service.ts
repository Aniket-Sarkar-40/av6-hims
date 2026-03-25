import {
  createSettingsInDb,
  getSettingsInDb,
} from "@/repository/master/settings.repository.js";
import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { addToCache, getAllCache } from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { PmsSettings } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("SETTINGS", "all");

export const settingsService = {
  async upsertSettings(input: CreateOrUpdateSettings): Promise<PmsSettings> {
    logger.info("entering::upsertSettings::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);

    const created = await createSettingsInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::upsertSettings::service");
    return created;
  },
  async getSettings(
    canNullReturnable: boolean = false,
  ): Promise<PmsSettings | null> {
    logger.info("entering::getSettings::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);
    let settings: PmsSettings | null = null;
    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as PmsSettings[] | null;
      if (cached && cached.length > 0) {
        logger.info("exiting::getSettings::service (cache)");
        settings = cached[0];
      }
    }

    settings = await getSettingsInDb();
    if (!settings && !canNullReturnable) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Settings"),
      );
    }

    logger.info("exiting::getSettings::service");
    return settings;
  },
};
