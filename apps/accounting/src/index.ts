import { createApp, type AppMode } from "@repo/platform";
import { accRouter } from "@/app.js";
import { type Application as ExpressApplication } from "express";

export function createAccApp(mode: AppMode): ExpressApplication {
  return createApp({ router: accRouter, basePath: "/api/v1/acc", mode });
}
