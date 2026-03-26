import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { inventoryRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createInvApp(
  mode: "STANDALONE" | "GATEWAY",
): ExpressApplication {
  const app = express();
  setupPlatform(app);
  if (mode === "STANDALONE") {
    app.use("/api/v1/inv", inventoryRouter);
  } else {
    app.use("/", inventoryRouter);
  }

  app.use(errorMiddleware);
  return app;
}
