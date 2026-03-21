import { logger } from "@repo/platform/logging/logger.js";
import { initializeCache } from "./config/redisClient.js";
import { createOpdApp } from "./index.js";
import { IS_REDIS, PORT } from "@repo/shared";
import { connectRedis } from "@repo/platform/cache/redisClient.js";

connectRedis()
  .then(() => {
    logger.info("Redis connected successfully");
    createOpdApp("STANDALONE").listen(PORT, async () => {
      console.log(`opd running on ${PORT}`);
      if (IS_REDIS) await initializeCache();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
