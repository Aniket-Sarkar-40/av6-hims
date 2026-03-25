import { createSettingsInDb, getSettingsInDb } from "@/repository/master/settings.repository";
import { CreateOrUpdateSettings } from "@/types/master/settings";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { Settings } from "@prisma/client";

const cacheKey = getRedisKey("SETTINGS", "all");

export const settingsService = {
  async upsertSettings(input: CreateOrUpdateSettings): Promise<Settings> {
    logger.info("entering::upsertSettings::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);

    const created = await createSettingsInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::upsertSettings::service");
    return created;
  },
  async getSettings(canNullReturnable: boolean = false): Promise<Settings | null> {
    logger.info("entering::getSettings::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);
    let settings: Settings | null = null;
    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as Settings[];
      if (cached && cached.length > 0) {
        logger.info("exiting::getSettings::service (cache)");
        settings = cached[0];
      }
    }

    settings = await getSettingsInDb();
    if (!settings && !canNullReturnable) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Settings"));
    }

    logger.info("exiting::getSettings::service");
    return settings;
  },
};
