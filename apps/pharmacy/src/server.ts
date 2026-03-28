import { logger } from "@repo/platform/logging/logger.js";
import { initializeCache } from "./config/redisClient.js";
import { createPharmacyApp } from "./index.js";
import { IS_REDIS, PORT } from "@repo/shared";
import { connectRedis } from "@repo/platform/cache/redisClient.js";

connectRedis()
  .then(() => {
    logger.info("Redis connected successfully");
    createPharmacyApp("STANDALONE").listen(PORT, async () => {
      console.log(`pharmacy running on ${PORT}`);
      if (IS_REDIS) await initializeCache();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
