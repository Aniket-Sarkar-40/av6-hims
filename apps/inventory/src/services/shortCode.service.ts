import { getShortCodeByCodeFromDb } from "@/repository/shortCode.repository";
import { logger } from "@/utils/logger.utils";
import { addToCache, getAllCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { DynamicShortCode } from "@prisma/client";

export const shortCodeService = {
  async getShortCodeByCode(shortCode: string): Promise<DynamicShortCode | null> {
    logger.info("entering::getShortCodeByCode::service");
    const cacheKey = getRedisKey("DYNAMIC_SHORT_CODE", "all");

    // Try to get from cache first
    const cachedShortCode: DynamicShortCode[] = ((await getAllCache(cacheKey)) as DynamicShortCode[]) || []; // Assuming getAllCache returns an array of DynamicShortCode;

    if (cachedShortCode && cachedShortCode.length > 0) {
      logger.info("Cache hit");
      return cachedShortCode.find((row) => row.shortCode === shortCode) || null;
    }

    const shortCodeData = await getShortCodeByCodeFromDb(shortCode);
    logger.info("exiting::getShortCodeByCodeFromDb::repository");

    if (shortCodeData) await addToCache(cacheKey, shortCodeData?.shortCode, shortCodeData);

    logger.info("exiting::getShortCodeByCode::service");
    return shortCodeData;
  },
};
