/* eslint-disable import/first */
const fetchMock = jest.fn();

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: fetchMock,
}));

import { fetchWithTimeout } from './fetchWithTimeout';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
  });

  it('adds a default timeout to fetch options', async () => {
    await fetchWithTimeout('https://wca.example/api', {
      headers: { Accept: 'application/json' },
    });

    expect(fetchMock).toHaveBeenCalledWith('https://wca.example/api', {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });
  });

  it('allows callers to override the timeout', async () => {
    await fetchWithTimeout('https://wca.example/api', {}, { timeoutMs: 2500 });

    expect(fetchMock).toHaveBeenCalledWith('https://wca.example/api', {
      timeout: 2500,
    });
  });

  it('retries transient response statuses', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await expect(
      fetchWithTimeout(
        'https://wca.example/api',
        {},
        { retries: 1, retryDelayMs: 0 }
      )
    ).resolves.toEqual({ ok: true, status: 200 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries thrown network errors', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('socket closed'))
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await expect(
      fetchWithTimeout(
        'https://wca.example/api',
        {},
        { retries: 1, retryDelayMs: 0 }
      )
    ).resolves.toEqual({ ok: true, status: 200 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
