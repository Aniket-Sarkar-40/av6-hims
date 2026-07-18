import express, { type Application } from "express";
import cors from "cors";
import { connectRedis } from "@repo/platform/cache/redisClient.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ENABLED_APPS, FRONTEND_URLS, IS_REDIS, PORT } from "@repo/shared";

import { createCoreApp } from "@apps/core";
import { createOpdApp } from "@apps/opd";
import { createPharmacyApp } from "@apps/pharmacy";
import { createInvApp } from "@apps/inv";
import { createAccApp } from "@apps/acc";

import { initializeCache as initializeCoreCache } from "@apps/core/config/redisClient.js";
import { initializeCache as initializeOpdCache } from "@apps/opd/config/redisClient.js";
import { initializeCache as initializeInvCache } from "@apps/inv/config/redisClient.js";
import { initializeCache as initializePharmacyCache } from "@apps/pharmacy/config/redisClient.js";
import { initializeCache as initializeAccCache } from "@apps/acc/config/redisClient.js";

/**
 * Central registry of mountable modules. Adding a new service only requires an
 * entry here - the gateway then mounts/initialises it automatically based on
 * the ENABLED_APPS env var.
 */
interface ModuleDefinition {
  code: string;
  mountPath: string;
  createApp: (mode: "STANDALONE" | "GATEWAY") => Application;
  initializeCache: () => Promise<void>;
}

const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    code: "core",
    mountPath: "/api/v1/core",
    createApp: createCoreApp,
    initializeCache: initializeCoreCache,
  },
  {
    code: "opd",
    mountPath: "/api/v1/opd",
    createApp: createOpdApp,
    initializeCache: initializeOpdCache,
  },
  {
    code: "pms",
    mountPath: "/api/v1/pms",
    createApp: createPharmacyApp,
    initializeCache: initializePharmacyCache,
  },
  {
    code: "inv",
    mountPath: "/api/v1/inv",
    createApp: createInvApp,
    initializeCache: initializeInvCache,
  },
  {
    code: "acc",
    mountPath: "/api/v1/acc",
    createApp: createAccApp,
    initializeCache: initializeAccCache,
  },
];

// Empty ENABLED_APPS => enable everything (dev convenience).
const enabledCodes = new Set(
  ENABLED_APPS.length ? ENABLED_APPS : MODULE_REGISTRY.map((m) => m.code)
);
const enabledModules = MODULE_REGISTRY.filter((m) => enabledCodes.has(m.code));

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

for (const module of enabledModules) {
  app.use(module.mountPath, module.createApp("GATEWAY"));
  logger.info(`Mounted module "${module.code}" at ${module.mountPath}`);
}

connectRedis()
  .then(() => {
    logger.info("Starting the Server...");
    app.listen(PORT, async () => {
      console.log(`gateway running on ${PORT}`);
      if (IS_REDIS) {
        for (const module of enabledModules) {
          await module.initializeCache();
        }
      }
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to Redis: ${err?.message}`);
  });
