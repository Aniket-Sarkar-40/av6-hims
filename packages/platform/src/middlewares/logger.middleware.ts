import { logger } from "@/logging/logger.js";
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";

const isProduction =
  process.env.NODE_ENV?.trim().toUpperCase() === "PRODUCTION";

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "oldpassword",
  "confirmpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "clientkey",
  "client-key",
  "secret",
  "otp",
]);

const MAX_LOGGED_BODY = 2_000;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : redact(v);
    }
    return out;
  }
  return value;
}

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message: string) => logger.http(`Request::${message.trim()}`),
    },
    skip: () => process.env.NODE_ENV === "test",
  },
);

export const requestDetailsLogger = morgan(
  (tokens, req: Request, res: Response) => {
    const time = tokens.date?.(req, res, "iso") ?? new Date().toISOString();
    const method = tokens.method?.(req, res) ?? req.method;
    const url = tokens.url?.(req, res) ?? req.originalUrl;
    const status = Number(tokens.status?.(req, res) ?? res.statusCode);
    const contentLength = tokens.res?.(req, res, "content-length");
    const responseTimeMs = Number(tokens["response-time"]?.(req, res) ?? 0);

    const entry = {
      time,
      ip: req.ip,
      method,
      url,
      status,
      contentLength,
      responseTimeMs,
      userAgent: req.get("user-agent"),
      /*  ---- extras ---- */
      query: req.query,
      params: req.params,
      body: redact(req.body), // will be {} for GET/HEAD
      headers: redact(req.headers),
    };
    return JSON.stringify(entry);
  },
  {
    stream: { write: (msg) => logger.debug(`RequestDetails::${msg.trim()}`) },
    skip: () => process.env.NODE_ENV === "test",
  },
) as any;

export function responseBodyLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Never log response payloads in production - they may contain PII/PHI.
  if (isProduction) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = (body: unknown): Response => {
    // stringify carefully (avoid circular structures), redact + truncate
    let payload: string;
    try {
      payload = JSON.stringify(redact(body));
      if (payload.length > MAX_LOGGED_BODY) {
        payload = `${payload.slice(0, MAX_LOGGED_BODY)}…[truncated]`;
      }
    } catch {
      payload = "[unserialisable payload]";
    }

    logger.debug(
      `↪️ ${req.method} ${req.originalUrl} → ${res.statusCode} | Response::body:: ${payload}`,
    );

    return originalJson(body);
  };

  next();
}
