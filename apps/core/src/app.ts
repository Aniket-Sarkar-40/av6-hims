import { authRoutes } from "./routes/auth/auth.routes.js";
import { Router, type Router as ExpressRouter } from "express";

export const coreRouter: ExpressRouter = Router();

coreRouter.use("/auth", authRoutes);
