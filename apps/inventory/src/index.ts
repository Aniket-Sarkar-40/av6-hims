import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { inventoryRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createCoreApp(
  mode: "STANDALONE" | "GATEWAY",
): ExpressApplication {
  const app = express();
  setupPlatform(app);
  if (mode === "STANDALONE") {
    app.use("/api/v1/inventory", inventoryRouter);
  } else {
    app.use("/", inventoryRouter);
  }

  app.use(errorMiddleware);
  return app;
}
