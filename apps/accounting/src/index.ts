import express from "express";
import { type Application as ExpressApplication } from "express";
import { accRouter } from "@/app.js";
import { errorMiddleware } from "@repo/platform/middlewares/error.middleware.js";
import { setupPlatform } from "@repo/platform";

export function createAccApp(
  mode: "STANDALONE" | "GATEWAY"
): ExpressApplication {
  const app = express();
  setupPlatform(app);
  if (mode === "STANDALONE") {
    app.use("/api/v1/acc", accRouter);
  } else {
    app.use("/", accRouter);
  }
  app.use(errorMiddleware);
  return app;
}
