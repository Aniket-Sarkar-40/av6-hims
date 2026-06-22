import { getRedisClient } from "@/cache/redisClient.js";
import { logger } from "@/logging/logger.js";
import { bigintToStringDeep, toItemSearch } from "@/utils/prisma.utils.js";
import { PmsItem } from "@repo/db/generated/prisma/client";
import {
  IS_REDIS,
  MASTER_TABLES,
  REDIS_PREFIX,
} from "@repo/shared/config/index.js";

export type DataType = {
  id: number;
  numCode?: number;
  emailType?: string;
  shortCode?: string;
};

export type Prefix = "core" | "inv" | "opd" | "pms" | "acc" | "blood-bank";

export const cacheKeyForItemSearch = `${REDIS_PREFIX}pms:pmsItem:search`;

/**
 * Create cache entries from an array of DataType.
 * Each element is stored in a Redis hash under the given key,
 * with the field name as the element's id (converted to a string).
 */
export async function createCache(
  table: string,
  data: DataType[],
  prefixProvided: Prefix
): Promise<void> {
  logger.info("entering:createCache");
  const prefix = MASTER_TABLES.includes(table) ? "master" : prefixProvided;
  const key = `${REDIS_PREFIX}${prefix}:${table}:all`;
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  for (const element of data) {
    if (table === "item") {
      const itemForSearch = toItemSearch(element as PmsItem);

      await redisClient.hSet(
        cacheKeyForItemSearch,
        element.id.toString(),
        JSON.stringify(itemForSearch)
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
      (table === "dynamicShortCode" || table === "uINConfig") &&
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

/**
 * Add one cache entry DataType.
 * Element is stored in a Redis hash under the given key and id.,
 * with the field name as the element's id (converted to a string).
 */
export async function addToCache(
  key: string,
  id: number | string,
  data: unknown
): Promise<void> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  const toCache = bigintToStringDeep(data);

  await redisClient.hSet(
    key,
    typeof id === "string" ? id : id.toString(),
    JSON.stringify(toCache)
  );
}

export async function addToCacheForLogin(
  key: string,
  id: number | string,
  data: unknown,
  ttl?: number
): Promise<void> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  const toCache = bigintToStringDeep(data);

  const fieldKey = `${REDIS_PREFIX}${key}:${id}`; // Create a unique key for that field
  if (ttl) {
    await redisClient.setEx(fieldKey, ttl, JSON.stringify(toCache));
  } else {
    await redisClient.set(fieldKey, JSON.stringify(toCache));
  }
}

/**
 * Update a single cache entry with a specific id.
 * This will overwrite the existing value for that id.
 */
export async function updateCache(
  key: string,
  id: number | string,
  data: DataType | unknown
): Promise<void> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  const toCache = bigintToStringDeep(data);

  await redisClient.hSet(
    key,
    typeof id === "string" ? id : id.toString(),
    JSON.stringify(toCache)
  );
}

/**
 * Delete a cache entry with a specific id.
 */
export async function deleteCache(
  key: string,
  id: number | string
): Promise<void> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  await redisClient.hDel(key, typeof id === "string" ? id : id.toString());
}

/**
 * Delete a cache entry with a specific id.
 */
export async function deleteCacheLogin(
  key: string,
  id: number | string
): Promise<void> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  await redisClient.del(`${REDIS_PREFIX}${key}:${id}`);
}

/**
 * Get a cache entry by id.
 * Returns the DataType object if found, otherwise null.
 */
export async function getCacheById(
  key: string,
  id: number | string
): Promise<unknown | null> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  const result = await redisClient.hGet(
    key,
    typeof id === "string" ? id : id.toString()
  );
  return result ? JSON.parse(result) : null;
}
/**
 * Get a cache entry by id.
 * Returns the DataType object if found, otherwise null.
 */
export async function getCacheLoginById(
  key: string,
  id: number | string
): Promise<unknown | null> {
  const redisClient = getRedisClient();
  if (redisClient === null) return;
  const result = await redisClient.get(`${REDIS_PREFIX}${key}:${id}`);
  return result ? JSON.parse(result) : null;
}

/**
 * Get all cache entries from the hash.
 * Returns an array of DataType objects.
 */
export async function getAllCache(key: string): Promise<unknown[]> {
  const redisClient = getRedisClient();
  if (redisClient === null) return [];
  const result = await redisClient.hGetAll(key);
  const data: unknown[] = [];
  for (const field in result) {
    if (result[field]) {
      data.push(JSON.parse(result[field]));
    }
  }
  return data;
}
