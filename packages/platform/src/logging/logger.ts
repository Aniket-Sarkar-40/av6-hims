import { requestStorage } from "@repo/platform/config/requestContext.js";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { envMode, LOG_DAYS } from "@repo/shared";

/* =========================
   Log Levels & Colors
========================= */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan",
});

/* =========================
   TraceId Injector
========================= */
const traceFormat = winston.format((info) => {
  const store = requestStorage.getStore();
  if (store?.traceId) {
    info.traceId = store.traceId;
  }
  return info;
});

/* =========================
   Common Log Format
========================= */
const logFormat = winston.format.combine(
  traceFormat(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS", // full timestamp
  }),
  winston.format.printf((info) => {
    const traceId = info.traceId ?? "-";
    return `${info.timestamp}: [${info.level}]: [traceId:${traceId}] ${info.message}`;
  }),
);

/* =========================
   Logger Instance
========================= */
export const logger = winston.createLogger({
  levels,
  level: envMode === "DEVELOPMENT" ? "debug" : "warn",
  format: logFormat,
  transports: [
    /* ---------- Error Logs ---------- */
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxFiles: LOG_DAYS, // keep 90 days (optional)
    }),

    /* ---------- Application Logs ---------- */
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: LOG_DAYS, // keep 90 days (optional)
    }),

    /* ---------- Console Logs ---------- */
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat,
      ),
    }),
  ],
});
