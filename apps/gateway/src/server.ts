import { createCoreApp } from "@apps/core";
import express from "express";
import { connectRedis } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";

const app = express();

const enabled = new Set(
  (process.env.ENABLED_APPS ?? "core,opd,pharmacy").split(",")
);

if (enabled.has("core")) app.use("/api/v1/core", createCoreApp());

const port = Number(process.env.PORT || 3005);

connectRedis()
  .then(() => {
    logger.info("Starting the Server...");
    app.listen(port, () => {
      console.log(`gateway running on ${port}`);
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
