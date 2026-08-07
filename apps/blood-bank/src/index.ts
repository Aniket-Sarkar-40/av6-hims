import { bloodBankRouter } from "@/app.js";
import { AppMode, createApp } from "@repo/platform";
import { type Application as ExpressApplication } from "express";

export function createBloodBankApp(mode: AppMode): ExpressApplication {
  return createApp({
    router: bloodBankRouter,
    basePath: "/api/v1/blood-bank",
    mode,
  });
}
