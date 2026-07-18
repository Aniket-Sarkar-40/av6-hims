import { createApp, type AppMode } from "@repo/platform";
import { opdRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createOpdApp(mode: AppMode): ExpressApplication {
  return createApp({ router: opdRouter, basePath: "/api/v1/opd", mode });
}
