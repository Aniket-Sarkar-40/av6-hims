import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  requestDetailsLogger,
  requestLogger,
  responseBodyLogger,
} from "@/middlewares/logger.middleware.js";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";

export function setupPlatform(app: Express) {
  // Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
  app.use(helmet());

  // Trace-ID middleware: reuse incoming header or generate a new one
  app.use((req: AuthRequest, res, next) => {
    // look for header in a case-insensitive way
    const incomingTraceId = req.header("X-Trace-Id");
    const traceId =
      incomingTraceId && incomingTraceId.trim() !== ""
        ? incomingTraceId
        : uuidv4();

    // req.traceId = traceId;
    // res.setHeader("X-Trace-Id", traceId);
    // next();
    // start a new ALS context for this request
    requestStorage.run({ traceId }, () => {
      req.traceId = traceId;
      res.setHeader("X-Trace-Id", traceId);
      next();
    });
  });

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  morgan.token("traceId", (req: AuthRequest) => req.traceId || "-");
  app.use(requestLogger);
  app.use(requestDetailsLogger);
  app.use(responseBodyLogger);
}
