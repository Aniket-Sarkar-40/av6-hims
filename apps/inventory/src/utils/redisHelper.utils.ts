import { toItemBatchStockCacheDTOList } from "@/mapper/stock/itemBatchStock.mapper.js";
import { cacheKeyForItemBatchStock } from "@/services/stock/itemStock.service.js";
import { bigintToStringDeep } from "@/utils/dynamicSearchHelper.js";
import { InvItemStock } from "@repo/db/generated/prisma/client";
import { getRedisClient } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MASTER_TABLES, REDIS_PREFIX } from "@repo/shared";
import { DataType } from "av6-core-v2";

const hSetPayload = async (
  redisClient: NonNullable<ReturnType<typeof getRedisClient>>,
  key: string,
  payload: Record<string, string>,
) => {
  if (Object.keys(payload).length === 0) return;

  await redisClient.hSet(key, payload);
};

/**
 * Create cache entries from an array of DataType.
 * Each element is stored in a Redis hash under the given key,
 * with the field name as the element's id (converted to a string).
 */
export async function createCache(
  table: string,
  data: DataType[],
): Promise<void> {
  logger.info("entering:createCache");

  const prefix = MASTER_TABLES.includes(table) ? "master" : "inv";
  const key = `${REDIS_PREFIX}${prefix}:${table}:all`;
  const redisClient = getRedisClient();

  if (redisClient === null) return;

  if (table === "invItemStock") {
    const stocks = data as InvItemStock[];
    const batchDTOs = await toItemBatchStockCacheDTOList(stocks);

    const batchStockPayload: Record<string, string> = {};

    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      const batchStockKey = `${stock.itemId}:${stock.batchNo ?? "NO_BATCH"}`;

      batchStockPayload[batchStockKey] = JSON.stringify(batchDTOs[i]);
    }

    await hSetPayload(
      redisClient,
      cacheKeyForItemBatchStock,
      batchStockPayload,
    );
  }

  const cachePayload: Record<string, string> = {};

  for (const element of data) {
    if (table === "eventEmail" && element.emailType) {
      const toCache = bigintToStringDeep(element);
      cachePayload[element.emailType.toString()] = JSON.stringify(toCache);
    } else if (
      (table === "invDynamicShortCode" || table === "invUINConfig") &&
      element.shortCode
    ) {
      const toCache = bigintToStringDeep(element);
      cachePayload[element.shortCode] = JSON.stringify(toCache);
    } else if (table === "country" && element.numCode) {
      cachePayload[element.numCode.toString()] = JSON.stringify(element);
    } else {
      const toCache = bigintToStringDeep(element);
      cachePayload[element.id.toString()] = JSON.stringify(toCache);
    }
  }

  await hSetPayload(redisClient, key, cachePayload);

  logger.info("exiting:createCache");
}
