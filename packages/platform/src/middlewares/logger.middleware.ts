import { logger } from "@/logging/logger.js";
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message: string) => logger.http(`Request::${message.trim()}`),
    },
    skip: () => process.env.NODE_ENV === "test",
  }
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
      body: req.body, // will be {} for GET/HEAD
      headers: req.headers,
    };
    return JSON.stringify(entry);
  },
  {
    stream: { write: (msg) => logger.debug(`RequestDetails::${msg.trim()}`) },
    skip: () => process.env.NODE_ENV === "test",
  }
) as any;

export function responseBodyLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json.bind(res);

  res.json = (body: unknown): Response => {
    // stringify carefully (avoid circular structures)
    let payload: string;
    try {
      payload = JSON.stringify(body);
    } catch {
      payload = "[unserialisable payload]";
    }

    logger.warn(
      `↪️ ${req.method} ${req.originalUrl} → ${res.statusCode} | Response::body:: ${payload}`
    );

    return originalJson(body);
  };

  next();
}
