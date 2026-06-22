import { fetchTableData } from "@/repository/common.repository.js";
import { db } from "@repo/db/client";
import { getRedisClient } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export const initializeCache = async (): Promise<void> => {
  if (!IS_REDIS) {
    logger.info("Redis is disabled: skipping cache initialization.");
    return;
  }

  logger.info("Initializing cache…");
  try {
    const tablesToCache = await fetchTableData("bloodBankDynamicShortCode");

    setTimeout(async () => {
      for (const table of tablesToCache) {
        if (!table?.isCacheable) continue;

        logger.info(`Caching data for table: ${table.tableName}`);
        try {
          await fetchTableData(table.tableName);
          logger.info(`Cached data for table: ${table.tableName}`);
        } catch (error) {
          logger.error(
            `Error caching data for table ${table.tableName}:`,
            error
          );
        }
      }
    }, 2_000);

    logger.info("Cache initialization kicked off.");
  } catch (error) {
    logger.error("Error initializing cache:", error);
  }
};

export const loadCache = async (
  cacheKey?: string | string[]
): Promise<void> => {
  if (!IS_REDIS) {
    logger.info("Redis is disabled: skipping cache load.");
    return;
  }

  const redisClient = getRedisClient();

  if (!redisClient) {
    throw new ErrorHandler(500, "Redis client is not initialized.");
  }

  type DSCRow = {
    shortCode: string;
    tableName: string;
    isCacheable: boolean;
  };

  const dynamicShortCodes: DSCRow[] =
    await db.bloodBankDynamicShortCode.findMany({
      select: { shortCode: true, tableName: true, isCacheable: true },
    });

  const validTables = new Set(
    dynamicShortCodes.filter((r) => r.isCacheable).map((r) => r.tableName)
  );

  const folderMap = dynamicShortCodes.reduce<Record<string, string[]>>(
    (acc, { shortCode, tableName, isCacheable }) => {
      if (isCacheable) {
        (acc[shortCode] ??= []).push(tableName);
      }
      return acc;
    },
    {}
  );

  const reloadTable = async (tableName: string) => {
    if (!validTables.has(tableName)) {
      throw new ErrorHandler(
        404,
        `Table "${tableName}" is not cacheable or does not exist.`
      );
    }
    logger.info(`Reloading cache for table "${tableName}"…`);
    await fetchTableData(tableName);
    logger.info(`✔ Reloaded cache for table "${tableName}".`);
  };

  const deleteCacheForTables = async (tables: string[]) => {
    if (!tables.length) return;

    const scanAll = async (pattern: string) => {
      let cursor = 0;
      const keys: string[] = [];

      do {
        const res = await redisClient!.scan(cursor.toString(), {
          MATCH: pattern,
          COUNT: 500,
        });
        cursor = Number(res.cursor);
        keys.push(...res.keys);
      } while (cursor !== 0);

      return keys;
    };

    await Promise.all(
      tables.map(async (table) => {
        const patterns = [
          `${REDIS_PREFIX}av6:${table}:*`,
          `${REDIS_PREFIX}master:${table}:*`,
        ];

        const keys = (await Promise.all(patterns.map(scanAll))).flat();
        const uniqueKeys = [...new Set(keys)];

        if (!uniqueKeys.length) {
          logger.info(`No cache keys found for table "${table}".`);
          return;
        }

        await redisClient!.del(uniqueKeys);
        logger.info(
          `Deleted ${uniqueKeys.length} cache key(s) for table "${table}".`
        );
      })
    );
  };

  const reloadTablesFromPattern = async (pattern: string): Promise<boolean> => {
    let cursor = 0;
    const matchedKeys: string[] = [];

    do {
      const { cursor: nextCursor, keys } = await redisClient!.scan(
        cursor.toString(),
        {
          MATCH: pattern,
          COUNT: 100,
        }
      );
      cursor = Number(nextCursor);
      matchedKeys.push(...keys);
    } while (cursor !== 0);

    if (!matchedKeys.length) return false;

    const tablesToReload = Array.from(
      new Set(
        matchedKeys
          .map((k) => k.split(":")[1])
          .filter((t): t is string => !!t && validTables.has(t))
      )
    );

    if (!tablesToReload.length) {
      throw new ErrorHandler(
        404,
        `Pattern "${pattern}" matched keys, but none belong to a cacheable table.`
      );
    }

    await Promise.all(tablesToReload.map(reloadTable));
    return true;
  };

  if (Array.isArray(cacheKey)) {
    for (const folderName of cacheKey) {
      const folderTables = folderMap[folderName];
      if (folderTables) {
        // Delete the cache for the specified folder tables
        await deleteCacheForTables(folderTables);
        logger.info(
          `Reloading folder "${folderName}" → [${folderTables.join(", ")}] (${
            folderTables.length
          } table(s))`
        );
        await Promise.all(folderTables.map(reloadTable));
      } else {
        logger.warn(`Folder "${folderName}" not found in cacheable folders.`);
      }
    }
    return;
  }

  if (!cacheKey) {
    logger.info(
      "No cacheKey: deleting all cache except the login folder and reloading ALL cacheable tables."
    );
    // Delete everything except the login folder
    const loginFolder = "login"; // Replace with your actual login folder name
    const otherTables = [...validTables].filter(
      (table) => table !== loginFolder
    );
    await deleteCacheForTables(otherTables);
    await Promise.all([...validTables].map(reloadTable));
    return;
  }

  if (cacheKey.includes("*")) {
    const matched = await reloadTablesFromPattern(cacheKey);
    if (!matched) {
      throw new ErrorHandler(
        404,
        `No cache entries match pattern "${cacheKey}".`
      );
    }
    return;
  }

  if (cacheKey.includes(":")) {
    if ((await redisClient.exists(cacheKey)) === 0) {
      throw new ErrorHandler(404, `Cache key "${cacheKey}" not found.`);
    }
    const tableName = cacheKey.split(":")[1];

    if (tableName) await reloadTable(tableName);
    return;
  }

  const folderTables = folderMap[cacheKey];
  if (folderTables) {
    logger.info(
      `Reloading folder "${cacheKey}" → [${folderTables.join(", ")}] (${
        folderTables.length
      } table(s))`
    );
    await deleteCacheForTables(folderTables);
    await Promise.all(folderTables.map(reloadTable));
    return;
  }

  if (validTables.has(cacheKey)) {
    await reloadTable(cacheKey);
    return;
  }

  throw new ErrorHandler(404, `No cacheable folder, table, or key found .`);
};

export const clearCache = async (cacheKey: string): Promise<void> => {
  if (!IS_REDIS) {
    logger.info("Redis is disabled: skipping cache deletion.");
    return;
  }

  const redisClient = getRedisClient();

  if (!redisClient) {
    throw new ErrorHandler(500, "Redis client is not initialized.");
  }

  try {
    if (cacheKey.includes("*")) {
      let cursor = 0;
      const matchedKeys: string[] = [];

      do {
        const { cursor: nextCursor, keys } = await redisClient.scan(
          cursor.toString(),
          {
            MATCH: cacheKey,
            COUNT: 100,
          }
        );
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          matchedKeys.push(...keys);
        }
      } while (cursor !== 0);

      if (matchedKeys.length === 0) {
        throw new ErrorHandler(
          404,
          `No cache entries found matching pattern '${cacheKey}'.`
        );
      }

      await redisClient.del(matchedKeys);
      logger.info(
        `Cleared ${matchedKeys.length} entr${
          matchedKeys.length === 1 ? "y" : "ies"
        } matching pattern '${cacheKey}'.`
      );
      return;
    }

    {
      let cursor = 0;
      const prefixPattern = `${cacheKey}:*`;
      const prefixMatchedKeys: string[] = [];

      do {
        const { cursor: nextCursor, keys } = await redisClient.scan(
          cursor.toString(),
          {
            MATCH: prefixPattern,
            COUNT: 100,
          }
        );
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          prefixMatchedKeys.push(...keys);
        }
      } while (cursor !== 0);
      if (prefixMatchedKeys.length > 0) {
        await redisClient.del(prefixMatchedKeys);
        logger.info(
          `Cleared ${prefixMatchedKeys.length} entr${
            prefixMatchedKeys.length === 1 ? "y" : "ies"
          } under prefix '${prefixPattern}'.`
        );
        return;
      }
    }

    {
      const exists = await redisClient.exists(cacheKey);
      if (exists === 0) {
        throw new ErrorHandler(
          404,
          `Cache key or folder '${cacheKey}' not found.`
        );
      }

      const deletedCount = await redisClient.del(cacheKey);
      if (deletedCount === 0) {
        throw new ErrorHandler(
          400,
          `Failed to delete cache key '${cacheKey}'.`
        );
      }

      logger.info(`Deleted cache key '${cacheKey}'.`);
      return;
    }
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    logger.error(`Error deleting cache for '${cacheKey}':`, err);
    throw new ErrorHandler(500, `Internal error clearing cache '${cacheKey}'.`);
  }
};

export const clearAllCache = async () => {
  if (!IS_REDIS) {
    logger.info("Redis is disabled: skipping full cache flush.");
    return;
  }

  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new ErrorHandler(500, "Redis client is not initialized.");
    }

    if (redisClient) {
      const keys = await redisClient.keys("*");
      const filteredKeys = keys.filter((key) => !key.includes("login"));

      if (filteredKeys.length > 0) {
        await redisClient.del(filteredKeys as unknown as [string]);
      }
    }
  } catch (error) {
    logger.error("Error flushing Redis cache:", error);
  }
};
