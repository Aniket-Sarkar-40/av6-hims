import { createApp, type AppMode } from "@repo/platform";
import { inventoryRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createInvApp(mode: AppMode): ExpressApplication {
  return createApp({ router: inventoryRouter, basePath: "/api/v1/inv", mode });
}
