import { getRedisKey } from "@/config/cache.config.js";
import { getShortCodeByCodeFromDb } from "@/repository/shortCode.repository.js";
import { AccDynamicShortCode } from "@repo/db/generated/prisma/client";
import { addToCache, getAllCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";

export const shortCodeService = {
  async getShortCodeByCode(
    shortCode: string,
  ): Promise<AccDynamicShortCode | null> {
    logger.info("entering::getShortCodeByCode::service");
    const cacheKey = getRedisKey("DYNAMIC_SHORT_CODE", "all");

    // Try to get from cache first
    const cachedShortCode: AccDynamicShortCode[] =
      ((await getAllCache(cacheKey)) as AccDynamicShortCode[]) || []; // Assuming getAllCache returns an array of DynamicShortCode;

    if (cachedShortCode && cachedShortCode.length > 0) {
      logger.info("Cache hit");
      return cachedShortCode.find((row) => row.shortCode === shortCode) || null;
    }

    const shortCodeData = await getShortCodeByCodeFromDb(shortCode);
    logger.info("exiting::getShortCodeByCodeFromDb::repository");

    if (shortCodeData)
      await addToCache(cacheKey, shortCodeData?.shortCode, shortCodeData);

    logger.info("exiting::getShortCodeByCode::service");
    return shortCodeData;
  },
};
