import { Router, type Router as ExpressRouter } from "express";
import cacheRouter from "./routes/cache.route.js";
import { commonRouter } from "./routes/common.route.js";
import { locationRouter } from "./routes/location/location.route.js";
import { settingsRouter } from "./routes/master/settings.route.js";
import { uinConfigRouter } from "./routes/master/uinConfig.route.js";
import hospitalRouter from "@/routes/master/hospital.route.js";
import { physicalExamRouter } from "@/routes/physicalExam/physicalExam.route.js";

export const bloodBankRouter: ExpressRouter = Router();

// Cache routes
bloodBankRouter.use("/cache", cacheRouter);
// Location
bloodBankRouter.use("/location", locationRouter);
// Common
bloodBankRouter.use("/common", commonRouter);
// Master
bloodBankRouter.use("/master/settings", settingsRouter);
bloodBankRouter.use("/master/uin-config", uinConfigRouter);
bloodBankRouter.use("/master/hospital", hospitalRouter);
bloodBankRouter.use("/physical-exam", physicalExamRouter);
