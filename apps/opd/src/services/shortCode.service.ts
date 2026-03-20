import { getShortCodeByCodeFromDb } from "@/repository/shortCode.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { addToCache, getAllCache } from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { OpdDynamicShortCode } from "@repo/db/generated/prisma/client";

export const shortCodeService = {
  async getShortCodeByCode(
    shortCode: string,
  ): Promise<OpdDynamicShortCode | null> {
    logger.info("entering::getShortCodeByCode::service");
    const cacheKey = getRedisKey("DYNAMIC_SHORT_CODE", "all");

    // Try to get from cache first
    const cachedShortCode: OpdDynamicShortCode[] =
      ((await getAllCache(cacheKey)) as OpdDynamicShortCode[]) || []; // Assuming getAllCache returns an array of OpdDynamicShortCode;

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
