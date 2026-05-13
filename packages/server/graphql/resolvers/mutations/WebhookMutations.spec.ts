/* eslint-disable import/first */
import { userFixture } from '../../../test/helpers';

const webhookFetch = jest.fn();

jest.mock('../../../controllers/webhooks', () => ({
  webhookFetch,
}));

import {
  createWebhook,
  deleteWebhook,
  testWebhook,
  testWebhooks,
  testEditingWebhook,
  updateWebhook,
} from './WebhookMutations';

const callCreateWebhook = createWebhook as (
  parent: unknown,
  args: {
    competitionId: string;
    webhook: {
      url: string;
      method: string;
      headers?: Array<{ key: string; value: string }>;
    };
  },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callUpdateWebhook = updateWebhook as (
  parent: unknown,
  args: {
    id: number;
    webhook: {
      url: string;
      method: string;
      headers?: Array<{ key: string; value: string }>;
    };
  },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callDeleteWebhook = deleteWebhook as (
  parent: unknown,
  args: { id: number },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callTestWebhooks = testWebhooks as (
  parent: unknown,
  args: { competitionId: string },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callTestWebhook = testWebhook as (
  parent: unknown,
  args: { id: number },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callTestEditingWebhook = testEditingWebhook as (
  parent: unknown,
  args: {
    competitionId: string;
    webhook: {
      url: string;
      method: string;
    };
  },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const createDb = () => ({
  competition: {
    findFirst: jest.fn().mockResolvedValue({
      id: 'TestComp2026',
      competitionAccess: [{ userId: 123 }],
      webhooks: [
        {
          id: 10,
          competitionId: 'TestComp2026',
          url: 'https://hooks.example/old',
          method: 'POST',
          headers: [],
        },
      ],
    }),
  },
  webhook: {
    create: jest.fn().mockResolvedValue({
      id: 10,
      url: 'https://hooks.example/new',
      method: 'POST',
      headers: [{ key: 'X-Test', value: 'true' }],
    }),
    update: jest.fn().mockResolvedValue({
      id: 10,
      url: 'https://hooks.example/updated',
      method: 'PUT',
      headers: [{ key: 'X-Test', value: 'true' }],
    }),
    delete: jest.fn().mockResolvedValue({ id: 10 }),
  },
});

describe('WebhookMutations', () => {
  beforeEach(() => {
    webhookFetch.mockReset().mockResolvedValue({
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue('pong'),
    });
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects creating webhooks without an authenticated user', async () => {
    await expect(
      callCreateWebhook(
        {},
        {
          competitionId: 'TestComp2026',
          webhook: {
            url: 'https://hooks.example/new',
            method: 'POST',
          },
        },
        { db: createDb(), user: undefined },
        {}
      )
    ).rejects.toThrow('Not Authenticated');
  });

  it('creates a webhook for competition staff without exposing custom headers', async () => {
    const db = createDb();

    await expect(
      callCreateWebhook(
        {},
        {
          competitionId: 'TestComp2026',
          webhook: {
            url: 'https://hooks.example/new',
            method: 'POST',
            headers: [{ key: 'X-Test', value: 'true' }],
          },
        },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).resolves.toEqual({
      id: 10,
      url: 'https://hooks.example/new',
      method: 'POST',
    });

    expect(db.webhook.create).toHaveBeenCalledWith({
      data: {
        competitionId: 'TestComp2026',
        url: 'https://hooks.example/new',
        method: 'POST',
      },
    });
  });

  it('allows the super-admin user to create and read custom headers', async () => {
    const db = createDb();

    await expect(
      callCreateWebhook(
        {},
        {
          competitionId: 'TestComp2026',
          webhook: {
            url: 'https://hooks.example/new',
            method: 'POST',
            headers: [{ key: 'X-Test', value: 'true' }],
          },
        },
        { db, user: userFixture({ id: 8184 }) },
        {}
      )
    ).resolves.toEqual({
      id: 10,
      url: 'https://hooks.example/new',
      method: 'POST',
      headers: [{ key: 'X-Test', value: 'true' }],
    });

    expect(db.webhook.create).toHaveBeenCalledWith({
      data: {
        competitionId: 'TestComp2026',
        url: 'https://hooks.example/new',
        method: 'POST',
        headers: [{ key: 'X-Test', value: 'true' }],
      },
    });
  });

  it('rejects webhook updates from users without competition access', async () => {
    const db = createDb();
    db.competition.findFirst.mockResolvedValue({
      competitionAccess: [{ userId: 999 }],
    });

    await expect(
      callUpdateWebhook(
        {},
        {
          id: 10,
          webhook: {
            url: 'https://hooks.example/updated',
            method: 'PUT',
          },
        },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).rejects.toThrow('Not Authorized');
  });

  it('updates a webhook for the super-admin user including headers', async () => {
    const db = createDb();

    await expect(
      callUpdateWebhook(
        {},
        {
          id: 10,
          webhook: {
            url: 'https://hooks.example/updated',
            method: 'PUT',
            headers: [{ key: 'X-Test', value: 'true' }],
          },
        },
        { db, user: userFixture({ id: 8184 }) },
        {}
      )
    ).resolves.toEqual({
      id: 10,
      url: 'https://hooks.example/updated',
      method: 'PUT',
      headers: [{ key: 'X-Test', value: 'true' }],
    });

    expect(db.webhook.update).toHaveBeenCalledWith({
      where: {
        id: 10,
      },
      data: {
        url: 'https://hooks.example/updated',
        method: 'PUT',
        headers: [{ key: 'X-Test', value: 'true' }],
      },
    });
  });

  it('deletes webhooks for authenticated users', async () => {
    const db = createDb();

    await expect(
      callDeleteWebhook(
        {},
        { id: 10 },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).resolves.toBeUndefined();

    expect(db.webhook.delete).toHaveBeenCalledWith({
      where: {
        id: 10,
      },
    });
  });

  it('tests unsaved webhook settings and returns response details', async () => {
    await expect(
      callTestEditingWebhook(
        {},
        {
          competitionId: 'TestComp2026',
          webhook: {
            url: 'https://hooks.example/new',
            method: 'POST',
          },
        },
        { db: createDb(), user: userFixture({ id: 123 }) },
        {}
      )
    ).resolves.toEqual({
      url: 'https://hooks.example/new',
      status: 200,
      statusText: 'OK',
      body: 'pong',
    });

    expect(webhookFetch).toHaveBeenCalledWith(
      {
        id: 0,
        competitionId: 'TestComp2026',
        url: 'https://hooks.example/new',
        method: 'POST',
        headers: [],
      },
      {
        competitionId: 'TestComp2026',
        notifications: [{ type: 'ping' }],
      }
    );
  });

  it('tests all saved webhooks and converts thrown fetches into empty responses', async () => {
    const db = createDb();
    db.competition.findFirst.mockResolvedValue({
      id: 'TestComp2026',
      competitionAccess: [{ userId: 123 }],
      webhooks: [
        {
          id: 10,
          url: 'https://hooks.example/ok',
          method: 'POST',
          headers: [],
        },
        {
          id: 11,
          url: 'https://hooks.example/fail',
          method: 'POST',
          headers: [],
        },
      ],
    });
    webhookFetch
      .mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('pong'),
      })
      .mockRejectedValueOnce(new Error('network failed'));

    await expect(
      callTestWebhooks(
        {},
        { competitionId: 'TestComp2026' },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).resolves.toEqual([
      {
        url: 'https://hooks.example/ok',
        status: 200,
        statusText: 'OK',
        body: 'pong',
      },
      {
        url: 'https://hooks.example/fail',
        status: 0,
        statusText: '',
        body: '',
      },
    ]);
  });

  it('rejects webhook tests when the competition cannot be found', async () => {
    const db = createDb();
    db.competition.findFirst.mockResolvedValue(null);

    await expect(
      callTestWebhooks(
        {},
        { competitionId: 'MissingComp2026' },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).rejects.toThrow('Competition not found');
  });

  it('tests one saved webhook and returns response details', async () => {
    const db = createDb();

    await expect(
      callTestWebhook(
        {},
        { id: 10 },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).resolves.toEqual({
      url: 'https://hooks.example/old',
      status: 200,
      statusText: 'OK',
      body: 'pong',
    });

    expect(webhookFetch).toHaveBeenCalledWith(
      {
        id: 10,
        competitionId: 'TestComp2026',
        url: 'https://hooks.example/old',
        method: 'POST',
        headers: [],
      },
      {
        competitionId: 'TestComp2026',
        notifications: [{ type: 'ping' }],
      }
    );
  });

  it('rejects one-webhook tests when the webhook cannot be found', async () => {
    const db = createDb();

    await expect(
      callTestWebhook(
        {},
        { id: 99 },
        { db, user: userFixture({ id: 123 }) },
        {}
      )
    ).rejects.toThrow('Webhook not found');
  });
});
