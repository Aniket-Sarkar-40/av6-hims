import { initializeAccCache } from "@/config/redisClient.js";
import { createAccApp } from "@/index.js";
import { connectRedis } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { IS_REDIS, PORT } from "@repo/shared";

connectRedis()
  .then(() => {
    logger.info("Redis connected successfully");
    createAccApp("STANDALONE").listen(PORT, async () => {
      console.log(`acc running on ${PORT}`);
      if (IS_REDIS) await initializeAccCache();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
