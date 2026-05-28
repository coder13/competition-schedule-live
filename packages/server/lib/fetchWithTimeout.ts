import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_DELAY_MS = 250;
const DEFAULT_RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export interface FetchPolicy {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  retryStatuses?: number[];
}

const wait = async (delayMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const shouldRetryResponse = (response: Response, retryStatuses: Set<number>) =>
  retryStatuses.has(response.status);

export const fetchWithTimeout = async (
  url: RequestInfo,
  init: RequestInit = {},
  policy: FetchPolicy | number = {}
): Promise<Response> => {
  const {
    timeoutMs = typeof policy === 'number' ? policy : DEFAULT_TIMEOUT_MS,
    retries = 0,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryStatuses = [...DEFAULT_RETRY_STATUSES],
  } = typeof policy === 'number' ? {} : policy;
  const retryStatusSet = new Set(retryStatuses);
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        timeout: timeoutMs,
      });

      if (attempt < retries && shouldRetryResponse(response, retryStatusSet)) {
        await wait(retryDelayMs);
        continue;
      }

      return response;
    } catch (e) {
      lastError = e;

      if (attempt >= retries) {
        throw e;
      }

      await wait(retryDelayMs);
    }
  }

  throw lastError;
};
