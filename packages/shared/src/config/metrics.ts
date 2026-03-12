import client from "prom-client";

// Create a registry (recommended instead of relying only on global registry)
export const register = new client.Registry();

// Add default Node.js/process metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
  register,
  prefix: "platform_",
});

// Custom HTTP metrics
export const httpRequestsTotal = new client.Counter({
  name: "platform_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export const httpRequestDurationMs = new client.Histogram({
  name: "platform_http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000],
  registers: [register],
});
