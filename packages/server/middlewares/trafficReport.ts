import { NextFunction, Request, RequestHandler, Response } from 'express';

interface TrafficCounter {
  count: number;
  totalDurationMs: number;
}

export interface TrafficReport {
  service: 'notifycomp-api';
  event: 'traffic-summary';
  windowStartedAt: string;
  windowEndedAt: string;
  durationSeconds: number;
  totalRequests: number;
  requestsPerMinute: number;
  statusCodes: Record<string, number>;
  methods: Record<string, number>;
  topRoutes: Array<{
    route: string;
    count: number;
    averageDurationMs: number;
  }>;
}

export interface TrafficReporterOptions {
  intervalMs?: number;
  now?: () => Date;
  logger?: (report: TrafficReport) => void;
}

interface TrafficCounts {
  totalRequests: number;
  statusCodes: Record<string, number>;
  methods: Record<string, number>;
  routes: Map<string, TrafficCounter>;
}

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
const MAX_TRACKED_ROUTES = 25;

const createEmptyCounts = (): TrafficCounts => {
  const statusCodes: Record<string, number> = {};
  const methods: Record<string, number> = {};

  return {
    totalRequests: 0,
    statusCodes,
    methods,
    routes: new Map<string, TrafficCounter>(),
  };
};

const incrementRecord = (record: Record<string, number>, key: string) => {
  record[key] = (record[key] ?? 0) + 1;
};

export const getTrafficReportIntervalMs = () => {
  const configured = Number(process.env.TRAFFIC_REPORT_INTERVAL_MS);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return DEFAULT_INTERVAL_MS;
};

export const normalizeTrafficRoute = (req: Request) => {
  const path = req.path || req.originalUrl.split('?')[0] || '/';

  if (path === '/graphql') {
    const operationName = req.body?.operationName;
    return operationName ? '/graphql/:operationName' : '/graphql';
  }

  return path
    .split('/')
    .map((segment) => {
      if (/^\d+$/.test(segment)) {
        return ':id';
      }

      if (/^v\d+$/.test(segment)) {
        return segment;
      }

      if (segment.length >= 4 && /\d/.test(segment)) {
        return ':token';
      }

      return segment;
    })
    .join('/');
};

export const buildTrafficReport = (
  counts: TrafficCounts,
  windowStartedAt: Date,
  windowEndedAt: Date
): TrafficReport => {
  const durationSeconds = Math.max(
    1,
    (windowEndedAt.getTime() - windowStartedAt.getTime()) / 1000
  );
  const topRoutes = [...counts.routes.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, MAX_TRACKED_ROUTES)
    .map(([route, counter]) => ({
      route,
      count: counter.count,
      averageDurationMs:
        Math.round((counter.totalDurationMs / counter.count) * 10) / 10,
    }));

  return {
    service: 'notifycomp-api',
    event: 'traffic-summary',
    windowStartedAt: windowStartedAt.toISOString(),
    windowEndedAt: windowEndedAt.toISOString(),
    durationSeconds: Math.round(durationSeconds),
    totalRequests: counts.totalRequests,
    requestsPerMinute:
      Math.round((counts.totalRequests / (durationSeconds / 60)) * 10) / 10,
    statusCodes: counts.statusCodes,
    methods: counts.methods,
    topRoutes,
  };
};

export const createTrafficReporter = ({
  intervalMs = getTrafficReportIntervalMs(),
  now = () => new Date(),
  logger = (report) => console.info(JSON.stringify(report)),
}: TrafficReporterOptions = {}) => {
  let counts = createEmptyCounts();
  let windowStartedAt = now();

  const recordRequest = (req: Request, res: Response, durationMs: number) => {
    counts.totalRequests += 1;
    incrementRecord(counts.statusCodes, String(res.statusCode));
    incrementRecord(counts.methods, req.method);

    const route = `${req.method} ${normalizeTrafficRoute(req)}`;
    const routeCounter = counts.routes.get(route) ?? {
      count: 0,
      totalDurationMs: 0,
    };

    routeCounter.count += 1;
    routeCounter.totalDurationMs += durationMs;
    counts.routes.set(route, routeCounter);
  };

  const flush = () => {
    const windowEndedAt = now();
    const report = buildTrafficReport(counts, windowStartedAt, windowEndedAt);

    logger(report);
    counts = createEmptyCounts();
    windowStartedAt = windowEndedAt;

    return report;
  };

  const middleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      recordRequest(req, res, Date.now() - startedAt);
    });

    next();
  };

  const timer = setInterval(flush, intervalMs);
  timer.unref?.();

  return {
    middleware,
    flush,
    shutdown: () => {
      clearInterval(timer);
      if (counts.totalRequests > 0) {
        flush();
      }
    },
  };
};
