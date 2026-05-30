import { Request, Response } from 'express';
import {
  buildTrafficReport,
  createTrafficReporter,
  getTrafficReportIntervalMs,
  normalizeTrafficRoute,
  TrafficReport,
} from './trafficReport';

const request = (props: Partial<Request>): Request => props as Request;

describe('trafficReport', () => {
  afterEach(() => {
    delete process.env.TRAFFIC_REPORT_INTERVAL_MS;
  });

  it('uses the configured reporting interval when valid', () => {
    process.env.TRAFFIC_REPORT_INTERVAL_MS = '60000';

    expect(getTrafficReportIntervalMs()).toBe(60000);
  });

  it('falls back to the default reporting interval when invalid', () => {
    process.env.TRAFFIC_REPORT_INTERVAL_MS = 'nope';

    expect(getTrafficReportIntervalMs()).toBe(15 * 60 * 1000);
  });

  it('normalizes path ids without exposing request-specific tokens', () => {
    expect(
      normalizeTrafficRoute(
        request({
          method: 'GET',
          path: '/competitions/TestComp2026/activities/123',
          originalUrl: '/competitions/TestComp2026/activities/123?x=y',
        })
      )
    ).toBe('/competitions/:token/activities/:id');
  });

  it('keeps API version segments readable', () => {
    expect(
      normalizeTrafficRoute(
        request({
          method: 'POST',
          path: '/v0/external/push/sessions',
          originalUrl: '/v0/external/push/sessions',
        })
      )
    ).toBe('/v0/external/push/sessions');
  });

  it('groups named graphql operations without logging the operation name', () => {
    expect(
      normalizeTrafficRoute(
        request({
          method: 'POST',
          path: '/graphql',
          originalUrl: '/graphql',
          body: {
            operationName: 'Competition',
          },
        })
      )
    ).toBe('/graphql/:operationName');
  });

  it('builds a compact traffic report', () => {
    const counts = {
      totalRequests: 3,
      statusCodes: {
        '200': 2,
        '500': 1,
      },
      methods: {
        GET: 2,
        POST: 1,
      },
      routes: new Map([
        ['GET /ping', { count: 2, totalDurationMs: 12 }],
        ['POST /graphql/:operationName', { count: 1, totalDurationMs: 18 }],
      ]),
    };

    expect(
      buildTrafficReport(
        counts,
        new Date('2026-05-29T10:00:00Z'),
        new Date('2026-05-29T10:01:00Z')
      )
    ).toEqual({
      service: 'notifycomp-api',
      event: 'traffic-summary',
      windowStartedAt: '2026-05-29T10:00:00.000Z',
      windowEndedAt: '2026-05-29T10:01:00.000Z',
      durationSeconds: 60,
      totalRequests: 3,
      requestsPerMinute: 3,
      statusCodes: {
        '200': 2,
        '500': 1,
      },
      methods: {
        GET: 2,
        POST: 1,
      },
      topRoutes: [
        {
          route: 'GET /ping',
          count: 2,
          averageDurationMs: 6,
        },
        {
          route: 'POST /graphql/:operationName',
          count: 1,
          averageDurationMs: 18,
        },
      ],
    });
  });

  it('records requests and flushes the current traffic window', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-29T10:00:00Z'));

    const reports: TrafficReport[] = [];
    const reporter = createTrafficReporter({
      intervalMs: 60000,
      now: () => new Date(Date.now()),
      logger: (report) => reports.push(report),
    });
    const res = {
      statusCode: 204,
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          callback();
        }
      }),
    } as unknown as Response;
    const next = jest.fn();

    reporter.middleware(
      request({
        method: 'GET',
        path: '/ping',
        originalUrl: '/ping',
      }),
      res,
      next
    );

    jest.setSystemTime(new Date('2026-05-29T10:01:00Z'));
    reporter.flush();

    expect(next).toHaveBeenCalled();
    expect(reports[0]).toMatchObject({
      totalRequests: 1,
      statusCodes: {
        '204': 1,
      },
      methods: {
        GET: 1,
      },
      topRoutes: [
        {
          route: 'GET /ping',
          count: 1,
        },
      ],
    });

    reporter.shutdown();
    jest.useRealTimers();
  });
});
