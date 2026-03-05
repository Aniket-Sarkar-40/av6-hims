import { Router } from "express";
import { authRoutes } from "./routes/auth/auth.routes";

export const coreRouter = Router();

coreRouter.use("/auth", authRoutes);
