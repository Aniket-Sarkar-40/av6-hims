import { createCoreApp } from "@apps/core";
import express from "express";
import { connectRedis } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { IS_REDIS, PORT } from "@repo/shared";
import { initializeCache as initializeCoreCache } from "@apps/core/config/redisClient.js";

const app = express();

const enabled = new Set(
  (process.env.ENABLED_APPS ?? "core,opd,pharmacy").split(","),
);

if (enabled.has("core")) app.use("/api/v1/core", createCoreApp());

connectRedis()
  .then(() => {
    logger.info("Starting the Server...");
    app.listen(PORT, async () => {
      console.log(`gateway running on ${PORT}`);
      if (IS_REDIS && enabled.has("core")) await initializeCoreCache();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
