import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { coreRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createCoreApp(): ExpressApplication {
  const app = express();
  setupPlatform(app);
  app.use("/api/v1/core", coreRouter);

  app.use(errorMiddleware);
  return app;
}
