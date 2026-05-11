import { createCoreApp } from "@apps/core";
import express from "express";
import { connectRedis } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { FRONTEND_URLS, IS_REDIS, PORT } from "@repo/shared";
import { initializeCache as initializeCoreCache } from "@apps/core/config/redisClient.js";
import { initializeCache as initializeOpdCache } from "@apps/opd/config/redisClient.js";
import { initializeCache as initializeInvCache } from "@apps/inv/config/redisClient.js";
import { initializeCache as initializePharmacyCache } from "@apps/pharmacy/config/redisClient.js";
import { createOpdApp } from "@apps/opd";
import { createInvApp } from "@apps/inv";
import { createPharmacyApp } from "@apps/pharmacy";
import cors from "cors";
import { createAccApp } from "@apps/acc";
import { initializeCache as initializeAccCache } from "@apps/acc/config/redisClient.js";

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin || FRONTEND_URLS.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "X-Trace-Id",
  ],
  exposedHeaders: ["Set-Cookie", "X-Trace-Id"],
};

app.use(cors(corsOptions));

const enabled = new Set(
  (process.env.ENABLED_APPS ?? "core,opd,pms").split(",")
);

if (enabled.has("core")) app.use("/api/v1/core", createCoreApp("GATEWAY"));
if (enabled.has("opd")) app.use("/api/v1/opd", createOpdApp("GATEWAY"));
if (enabled.has("pms")) app.use("/api/v1/pms", createPharmacyApp("GATEWAY"));
if (enabled.has("inv")) app.use("/api/v1/inv", createInvApp("GATEWAY"));
if (enabled.has("acc")) app.use("/api/v1/acc", createAccApp("GATEWAY"));

connectRedis()
  .then(() => {
    logger.info("Starting the Server...");
    app.listen(PORT, async () => {
      console.log(`gateway running on ${PORT}`);
      if (IS_REDIS && enabled.has("core")) await initializeCoreCache();
      if (IS_REDIS && enabled.has("opd")) await initializeOpdCache();
      if (IS_REDIS && enabled.has("pharmacy")) await initializePharmacyCache();
      if (IS_REDIS && enabled.has("inv")) await initializeInvCache();
      if (IS_REDIS && enabled.has("acc")) await initializeAccCache();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
