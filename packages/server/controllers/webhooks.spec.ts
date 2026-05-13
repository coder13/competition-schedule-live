/* eslint-disable import/first */
const fetchMock = jest.fn();
const webhookFindMany = jest.fn();

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: fetchMock,
}));

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    webhook: {
      findMany: webhookFindMany,
    },
  },
}));

import {
  sendWebhook,
  sendWebhooksForCompetition,
  webhookFetch,
} from './webhooks';

const webhook = {
  id: 1,
  competitionId: 'TestComp2026',
  url: 'https://hooks.example/notify',
  method: 'POST',
  headers: [{ key: 'X-Test', value: 'true' }],
};

describe('webhook controllers', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    webhookFindMany.mockReset();
  });

  it('sends JSON data with stored webhook headers', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue(''),
    };
    fetchMock.mockResolvedValue(response);

    await expect(
      webhookFetch(webhook as never, {
        competitionId: 'TestComp2026',
        notifications: [{ type: 'ping' }],
      })
    ).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledWith('https://hooks.example/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test': 'true',
      },
      body: JSON.stringify({
        competitionId: 'TestComp2026',
        notifications: [{ type: 'ping' }],
      }),
    });
  });

  it('throws with response details for failed webhook responses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      text: jest.fn().mockResolvedValue('boom'),
    });

    await expect(sendWebhook(webhook as never, {})).rejects.toThrow(
      'Webhook failed with status code 500 and message Server Error: boom'
    );
  });

  it('loads competition webhooks case-insensitively and settles each send', async () => {
    const okWebhook = { ...webhook, id: 1, url: 'https://hooks.example/ok' };
    const badWebhook = {
      ...webhook,
      id: 2,
      url: 'https://hooks.example/bad',
    };
    webhookFindMany.mockResolvedValue([okWebhook, badWebhook]);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('invalid'),
      });

    const results = await sendWebhooksForCompetition('testcomp2026', {
      type: 'ping',
    });

    expect(webhookFindMany).toHaveBeenCalledWith({
      where: {
        competitionId: {
          equals: 'testcomp2026',
          mode: 'insensitive',
        },
      },
    });
    expect(results.map((result) => result.status)).toEqual([
      'fulfilled',
      'rejected',
    ]);
  });
});
