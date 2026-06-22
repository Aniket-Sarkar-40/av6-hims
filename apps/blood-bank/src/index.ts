import express from "express";
import { setupPlatform, errorMiddleware } from "@repo/platform";
import { type Application as ExpressApplication } from "express";
import { bloodBankRouter } from "@/app.js";

export function createBloodBankApp(
  mode: "STANDALONE" | "GATEWAY"
): ExpressApplication {
  const app = express();
  setupPlatform(app);
  if (mode === "STANDALONE") {
    app.use("/api/v1/blood-bank", bloodBankRouter);
  } else {
    app.use("/", bloodBankRouter);
  }
  app.use(errorMiddleware);
  return app;
}
