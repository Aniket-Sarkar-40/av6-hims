import { createClient, RedisClientType } from "redis";
import {
  IS_REDIS,
  REDIS_URL,
  REDIS_PASSWORD,
  REDIS_PREFIX,
} from "@repo/shared/config/index.js";
import { logger } from "@/logging/logger.js";

let redisClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType | null => {
  if (!IS_REDIS) return null;

  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL, password: REDIS_PASSWORD });
    redisClient.on("error", (err) => {
      logger.error("Redis Client Error", err);
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  if (!IS_REDIS) {
    logger.info("Redis is disabled: skipping connection.");
    return;
  }

  const client = getRedisClient()!;
  if (!client.isOpen) {
    await client.connect();
    logger.info("Redis client connected.");
  }
};
