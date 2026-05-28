/* eslint-disable import/first */
const transaction = jest.fn();
const pushSubscriptionUpdateMany = jest.fn();
const tx = {
  pushSubscription: {
    upsert: jest.fn(),
    update: jest.fn(),
    findFirstOrThrow: jest.fn(),
  },
  assignmentWatch: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
};

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    $transaction: transaction,
    pushSubscription: {
      updateMany: pushSubscriptionUpdateMany,
    },
  },
}));

import {
  disableCompetitionGroupsPushSubscription,
  disableCompetitionGroupsPushSubscriptionSession,
  updateCompetitionGroupsPushSubscriptionSession,
  upsertCompetitionGroupsPushSubscription,
} from './pushSubscriptions';

describe('push subscription controllers', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00Z'));
    transaction.mockImplementation(async (callback) => callback(tx));
    pushSubscriptionUpdateMany.mockReset().mockResolvedValue({ count: 1 });
    tx.pushSubscription.upsert.mockReset().mockResolvedValue({ id: 10 });
    tx.pushSubscription.update.mockReset().mockResolvedValue({ id: 10 });
    tx.pushSubscription.findFirstOrThrow.mockReset().mockResolvedValue({
      id: 10,
      watches: [],
    });
    tx.assignmentWatch.deleteMany.mockReset().mockResolvedValue({ count: 1 });
    tx.assignmentWatch.createMany.mockReset().mockResolvedValue({ count: 2 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('upserts a Competition Groups subscription and replaces watches', async () => {
    await expect(
      upsertCompetitionGroupsPushSubscription({
        endpoint: 'https://push.example/subscription',
        p256dh: 'p256dh',
        auth: 'auth',
        externalSubject: 'remote-user',
        watches: [
          { competitionId: 'Alpha2026', wcaUserId: 123 },
          { competitionId: 'Beta2026', wcaUserId: 456 },
        ],
      })
    ).resolves.toEqual({ id: 10, watches: [] });

    expect(tx.pushSubscription.upsert).toHaveBeenCalledWith({
      where: {
        endpoint: 'https://push.example/subscription',
      },
      update: {
        p256dh: 'p256dh',
        auth: 'auth',
        source: 'competitiongroups',
        externalSubject: 'remote-user',
        disabledAt: null,
      },
      create: {
        endpoint: 'https://push.example/subscription',
        p256dh: 'p256dh',
        auth: 'auth',
        source: 'competitiongroups',
        externalSubject: 'remote-user',
      },
    });
    expect(tx.assignmentWatch.deleteMany).toHaveBeenCalledWith({
      where: {
        pushSubscriptionId: 10,
      },
    });
    expect(tx.assignmentWatch.createMany).toHaveBeenCalledWith({
      data: [
        {
          pushSubscriptionId: 10,
          competitionId: 'Alpha2026',
          wcaUserId: 123,
        },
        {
          pushSubscriptionId: 10,
          competitionId: 'Beta2026',
          wcaUserId: 456,
        },
      ],
      skipDuplicates: true,
    });
    expect(tx.pushSubscription.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 10,
      },
      include: {
        watches: true,
      },
    });
  });

  it('does not create watches when the watch list is empty', async () => {
    await upsertCompetitionGroupsPushSubscription({
      endpoint: 'https://push.example/subscription',
      p256dh: 'p256dh',
      auth: 'auth',
      externalSubject: 'remote-user',
      watches: [],
    });

    expect(tx.assignmentWatch.createMany).not.toHaveBeenCalled();
  });

  it('disables a Competition Groups subscription by endpoint and subject', async () => {
    await expect(
      disableCompetitionGroupsPushSubscription(
        'https://push.example/subscription',
        'remote-user'
      )
    ).resolves.toEqual({ count: 1 });

    expect(pushSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: {
        endpoint: 'https://push.example/subscription',
        source: 'competitiongroups',
        externalSubject: 'remote-user',
      },
      data: {
        disabledAt: new Date('2026-01-01T10:00:00Z'),
      },
    });
  });

  it('updates a Competition Groups subscription session and replaces watches', async () => {
    tx.pushSubscription.findFirstOrThrow
      .mockResolvedValueOnce({
        id: 10,
        endpoint: 'https://push.example/subscription',
        source: 'competitiongroups',
        externalSubject: 'remote-user',
        watches: [],
      })
      .mockResolvedValueOnce({
        id: 10,
        endpoint: 'https://push.example/subscription',
        source: 'competitiongroups',
        externalSubject: 'remote-user',
        watches: [],
      });

    await expect(
      updateCompetitionGroupsPushSubscriptionSession({
        endpoint: 'https://push.example/new-subscription',
        p256dh: 'new-p256dh',
        auth: 'new-auth',
        externalSubject: 'remote-user',
        pushSubscriptionId: 10,
        watches: [{ competitionId: 'Alpha2026', wcaUserId: 123 }],
      })
    ).resolves.toEqual({
      id: 10,
      endpoint: 'https://push.example/subscription',
      source: 'competitiongroups',
      externalSubject: 'remote-user',
      watches: [],
    });

    expect(tx.pushSubscription.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 10,
        source: 'competitiongroups',
        externalSubject: 'remote-user',
        disabledAt: null,
      },
    });
    expect(tx.pushSubscription.update).toHaveBeenCalledWith({
      where: {
        id: 10,
      },
      data: {
        endpoint: 'https://push.example/new-subscription',
        p256dh: 'new-p256dh',
        auth: 'new-auth',
      },
    });
    expect(tx.assignmentWatch.deleteMany).toHaveBeenCalledWith({
      where: {
        pushSubscriptionId: 10,
      },
    });
    expect(tx.assignmentWatch.createMany).toHaveBeenCalledWith({
      data: [
        {
          pushSubscriptionId: 10,
          competitionId: 'Alpha2026',
          wcaUserId: 123,
        },
      ],
      skipDuplicates: true,
    });
    expect(tx.pushSubscription.findFirstOrThrow).toHaveBeenLastCalledWith({
      where: {
        id: 10,
        source: 'competitiongroups',
        externalSubject: 'remote-user',
        disabledAt: null,
      },
      include: {
        watches: true,
      },
    });
  });

  it('disables a Competition Groups subscription session', async () => {
    await expect(
      disableCompetitionGroupsPushSubscriptionSession(10, 'remote-user')
    ).resolves.toEqual({ count: 1 });

    expect(pushSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: {
        id: 10,
        source: 'competitiongroups',
        externalSubject: 'remote-user',
        disabledAt: null,
      },
      data: {
        disabledAt: new Date('2026-01-01T10:00:00Z'),
      },
    });
  });
});
