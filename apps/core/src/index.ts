import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { coreRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createCoreApp(): ExpressApplication {
  const app = express();
  setupPlatform(app);
  app.use("/", coreRouter);
  app.use(errorMiddleware);
  return app;
}
