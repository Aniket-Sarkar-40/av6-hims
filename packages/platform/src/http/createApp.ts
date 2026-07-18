import express, { type Application, type Router } from "express";
import { setupPlatform } from "./setupPlatform.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";

export type AppMode = "STANDALONE" | "GATEWAY";

export interface CreateAppOptions {
  /** The domain router (e.g. coreRouter). */
  router: Router;
  /**
   * Path the router mounts at when the service runs on its own
   * (e.g. "/api/v1/core"). Ignored in GATEWAY mode, where the gateway owns the
   * prefix and the router is mounted at "/".
   */
  basePath: string;
  mode: AppMode;
}

/**
 * Builds a fully wired Express application (platform middleware + router +
 * error handler). Every service uses this so app bootstrap is defined once.
 */
export function createApp({
  router,
  basePath,
  mode,
}: CreateAppOptions): Application {
  const app = express();
  setupPlatform(app);
  app.use(mode === "STANDALONE" ? basePath : "/", router);
  app.use(errorMiddleware);
  return app;
}
