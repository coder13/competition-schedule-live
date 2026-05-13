/* eslint-disable import/first */
const competitionAccessFindMany = jest.fn();
const assignmentWatchFindMany = jest.fn();
const pushDeliveryFindFirst = jest.fn();
const pushDeliveryCreate = jest.fn();
const pushDeliveryUpdate = jest.fn();
const sendAssignmentPush = jest.fn();

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    competitionAccess: {
      findMany: competitionAccessFindMany,
    },
    assignmentWatch: {
      findMany: assignmentWatchFindMany,
    },
    pushDelivery: {
      findFirst: pushDeliveryFindFirst,
      create: pushDeliveryCreate,
      update: pushDeliveryUpdate,
    },
  },
}));

jest.mock('./webPush', () => ({
  sendAssignmentPush,
}));

import { sendActivityHeadsUpPush } from './activityHeadsUpNotifications';

const subscription = {
  id: 10,
  endpoint: 'https://push.example/subscription',
  p256dh: 'p256dh',
  auth: 'auth',
};

describe('sendActivityHeadsUpPush', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      COMPETITION_GROUPS_ORIGIN: 'https://groups.example/',
    };
    competitionAccessFindMany.mockReset().mockResolvedValue([{ userId: 123 }]);
    assignmentWatchFindMany.mockReset().mockResolvedValue([
      {
        pushSubscription: subscription,
      },
    ]);
    pushDeliveryFindFirst.mockReset().mockResolvedValue(null);
    pushDeliveryCreate.mockReset().mockResolvedValue({ id: 20 });
    pushDeliveryUpdate.mockReset().mockResolvedValue({ id: 20 });
    sendAssignmentPush.mockReset().mockResolvedValue({
      success: true,
      error: null,
    });
  });

  afterEach(() => {
    process.env = env;
  });

  it('sends one deduped heads-up push per organizer subscription', async () => {
    const startsAt = new Date('2026-01-01T10:00:00Z');

    await sendActivityHeadsUpPush('TestComp2026', [2, 1], startsAt);

    const dedupeKey =
      'activity-heads-up:TestComp2026:123:1,2:2026-01-01T10:00:00.000Z';

    expect(competitionAccessFindMany).toHaveBeenCalledWith({
      distinct: ['userId'],
      where: {
        competitionId: 'TestComp2026',
        roomId: 0,
      },
      select: {
        userId: true,
      },
    });
    expect(assignmentWatchFindMany).toHaveBeenCalledWith({
      where: {
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        pushSubscription: {
          disabledAt: null,
        },
      },
      include: {
        pushSubscription: true,
      },
    });
    expect(pushDeliveryCreate).toHaveBeenCalledWith({
      data: {
        pushSubscriptionId: 10,
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        dedupeKey,
        status: 'pending',
      },
    });
    expect(sendAssignmentPush).toHaveBeenCalledWith(subscription, {
      type: 'activity-heads-up',
      competitionId: 'TestComp2026',
      activityIds: [2, 1],
      startsAt: '2026-01-01T10:00:00.000Z',
      title: 'Activity starting soon',
      body: '2 activities will start in 5 minutes.',
      url: 'https://groups.example/competitions/TestComp2026/persons/123',
    });
    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: 'sent',
        error: undefined,
      },
    });
  });

  it('skips subscriptions that already received the same heads-up delivery', async () => {
    pushDeliveryFindFirst.mockResolvedValue({ id: 99 });

    await sendActivityHeadsUpPush(
      'TestComp2026',
      [1],
      new Date('2026-01-01T10:00:00Z')
    );

    expect(pushDeliveryCreate).not.toHaveBeenCalled();
    expect(sendAssignmentPush).not.toHaveBeenCalled();
    expect(pushDeliveryUpdate).not.toHaveBeenCalled();
  });

  it('records failed deliveries with the push error payload', async () => {
    delete process.env.COMPETITION_GROUPS_ORIGIN;
    sendAssignmentPush.mockResolvedValue({
      success: false,
      error: { message: 'push failed' },
    });

    await sendActivityHeadsUpPush(
      'TestComp2026',
      [1],
      new Date('2026-01-01T10:00:00Z')
    );

    expect(sendAssignmentPush).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        body: 'An activity will start in 5 minutes.',
        url: undefined,
      })
    );
    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: 'failed',
        error: { message: 'push failed' },
      },
    });
  });
});
