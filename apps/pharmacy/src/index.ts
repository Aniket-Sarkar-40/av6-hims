import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { pharmacyRouter } from "./app.js";
import { type Application as ExpressApplication } from "express";

export function createPharmacyApp(
  mode: "STANDALONE" | "GATEWAY",
): ExpressApplication {
  const app = express();
  setupPlatform(app);
  if (mode === "STANDALONE") {
    app.use("/api/v1/pharmacy", pharmacyRouter);
  } else {
    app.use("/", pharmacyRouter);
  }
  app.use(errorMiddleware);
  return app;
}
