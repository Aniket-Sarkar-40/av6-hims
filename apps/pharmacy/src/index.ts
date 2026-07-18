import { createApp, type AppMode } from "@repo/platform";
import { pharmacyRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createPharmacyApp(mode: AppMode): ExpressApplication {
  return createApp({ router: pharmacyRouter, basePath: "/api/v1/pms", mode });
}
