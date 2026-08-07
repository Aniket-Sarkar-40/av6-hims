import { logger } from "@repo/platform/logging/logger.js";
import { initializeCache } from "./config/redisClient.js";
import { createBloodBankApp } from "./index.js";
import { IS_REDIS, PORT } from "@repo/shared";
import { connectRedis } from "@repo/platform/cache/redisClient.js";

connectRedis()
  .then(() => {
    logger.info("Redis connected successfully");
    createBloodBankApp("STANDALONE").listen(PORT, async () => {
      console.log(`blood bank running on ${PORT}`);
      if (IS_REDIS) await initializeCache();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
