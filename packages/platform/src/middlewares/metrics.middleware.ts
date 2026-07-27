import type { NextFunction, Request, Response } from "express";
import {
  httpRequestDurationMs,
  httpRequestsTotal,
} from "@repo/shared/config/metrics.js";

function getRouteLabel(req: Request): string {
  // Prefer matched route path after routing, fallback to originalUrl path part
  // Example labels: /api/v1/common/fixedSearch or /api/v1/customer/:id
  const routePath = req.route?.path;
  if (routePath) {
    const base = req.baseUrl || "";
    return `${base}${routePath}`;
  }

  // fallback (avoid query strings)
  return req.originalUrl.split("?")[0] || req.path || "unknown";
}

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationMs = Number(durationNs) / 1_000_000;

    const route = getRouteLabel(req);
    const method = req.method;
    const status_code = String(res.statusCode);

    httpRequestsTotal.inc({ method, route, status_code });
    httpRequestDurationMs.observe({ method, route, status_code }, durationMs);
  });

  next();
}
