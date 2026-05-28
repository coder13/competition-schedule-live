/* eslint-disable import/first */
const fetchMock = jest.fn();

jest.mock('../lib/fetchWithTimeout', () => ({
  fetchWithTimeout: fetchMock,
}));

import { fetchWcif } from './wcif';

describe('fetchWcif', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      WCA_ORIGIN: 'https://wca.example',
      WCA_OAUTH_TOKEN: 'access-token',
    };
    fetchMock.mockReset();
  });

  afterEach(() => {
    process.env = env;
  });

  it('fetches WCIF using configured origin and OAuth token', async () => {
    const wcif = { id: 'TestComp2026', persons: [] };
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(wcif),
    });

    await expect(fetchWcif('TestComp2026')).resolves.toEqual(wcif);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://wca.example/api/v0/competitions/TestComp2026/wcif',
      {
        headers: {
          Authorization: 'Bearer access-token',
        },
      },
      { retries: 2 }
    );
  });

  it('throws when WCA returns a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchWcif('MissingComp2026')).rejects.toThrow(
      'Failed to fetch WCIF for MissingComp2026: 404 Not Found'
    );
  });
});
