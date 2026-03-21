import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { opdRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createOpdApp(
  mode: "STANDALONE" | "GATEWAY",
): ExpressApplication {
  const app = express();
  setupPlatform(app);
  if (mode === "STANDALONE") {
    app.use("/api/v1/opd", opdRouter);
  } else {
    app.use("/", opdRouter);
  }
  app.use(errorMiddleware);
  return app;
}
