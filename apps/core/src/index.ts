import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { coreRouter } from "./app";

export function createApp() {
  const app = express();
  setupPlatform(app);
  app.use("/api", coreRouter);
  app.use(errorMiddleware);
  return app;
}
