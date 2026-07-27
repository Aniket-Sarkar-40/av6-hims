import { createApp, type AppMode } from "@repo/platform";
import { coreRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createCoreApp(mode: AppMode): ExpressApplication {
  return createApp({ router: coreRouter, basePath: "/api/v1/core", mode });
}
