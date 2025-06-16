import { api, middleware } from "encore.dev/api";

interface RequestTiming {
  method: string;
  path: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
}

interface RequestMetrics {
  metrics: RequestTiming[];
}

const MAX_ENTRIES = 1000;

export const requestMetrics: RequestTiming[] = [];

function record(entry: RequestTiming): void {
  requestMetrics.push(entry);
  if (requestMetrics.length > MAX_ENTRIES) {
    requestMetrics.shift();
  }
}

export const recordTiming = middleware(async (req, next) => {
  const start = Date.now();
  const resp = await next(req);
  const end = Date.now();
  const meta = req.requestMeta;
  if (meta && meta.type === "api-call") {
    record({
      method: meta.method,
      path: meta.path,
      startedAt: new Date(start).toISOString(),
      endedAt: new Date(end).toISOString(),
      durationMs: end - start,
    });
  }
  return resp;
});

export const getRequestMetrics = api<void, RequestMetrics>(
  { expose: true, method: "GET", path: "/metrics" },
  async () => ({ metrics: requestMetrics })
);
