import { getShortCodeByCodeFromDb } from "@/repository/shortCode.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { getRedisKey } from "@/config/cache.config.js";
import { PmsDynamicShortCode } from "@repo/db/generated/prisma/client";
import { getAllCache } from "@repo/platform/cache/redis.utils.js";
import { addToCache } from "@repo/platform/cache/redis.utils.js";

export const shortCodeService = {
  async getShortCodeByCode(
    shortCode: string,
  ): Promise<PmsDynamicShortCode | null> {
    logger.info("entering::getShortCodeByCode::service");
    const cacheKey = getRedisKey("DYNAMIC_SHORT_CODE", "all");

    // Try to get from cache first
    const cachedShortCode: PmsDynamicShortCode[] =
      ((await getAllCache(cacheKey)) as PmsDynamicShortCode[]) || []; // Assuming getAllCache returns an array of DynamicShortCode;

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
