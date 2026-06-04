import { toItemBatchStockCacheDTO } from "@/mapper/stock/itemBatchStock.mapper.js";
import { cacheKeyForItemBatchStock } from "@/services/stock/itemStock.service.js";
import { bigintToStringDeep } from "@/utils/dynamicSearchHelper.js";
import { InvItemStock } from "@repo/db/generated/prisma/client";
import { getRedisClient } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MASTER_TABLES, REDIS_PREFIX } from "@repo/shared";
import { DataType } from "av6-core-v2";

/**
 * Create cache entries from an array of DataType.
 * Each element is stored in a Redis hash under the given key,
 * with the field name as the element's id (converted to a string).
 */
export async function createCache(
  table: string,
  data: DataType[]
): Promise<void> {
  logger.info("entering:createCache");
  const prefix = MASTER_TABLES.includes(table) ? "master" : "inv";
  const key = `${REDIS_PREFIX}${prefix}:${table}:all`;
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  for (const element of data) {
    if (table === "invItemStock") {
      const stock = element as InvItemStock;
      const itemBatchStock = await toItemBatchStockCacheDTO(stock);
      const batchStockKey = `${stock.itemId}:${stock.batchNo ?? "NO_BATCH"}`;

      await redisClient.hSet(
        cacheKeyForItemBatchStock,
        batchStockKey,
        JSON.stringify(itemBatchStock)
      );
    }

    if (table === "eventEmail" && element.emailType) {
      const toCache = bigintToStringDeep(element);

      await redisClient.hSet(
        key,
        element.emailType.toString(),
        JSON.stringify(toCache)
      );
    } else if (
      (table === "invDynamicShortCode" || table === "invUINConfig") &&
      element.shortCode
    ) {
      const toCache = bigintToStringDeep(element);
      await redisClient.hSet(key, element.shortCode, JSON.stringify(toCache));
    } else if (table === "country" && element.numCode) {
      await redisClient.hSet(
        key,
        element.numCode.toString(),
        JSON.stringify(element)
      );
    } else {
      const toCache = bigintToStringDeep(element);

      await redisClient.hSet(
        key,
        element.id.toString(),
        JSON.stringify(toCache)
      );
    }
  }
}
