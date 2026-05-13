/* eslint-disable import/first */
const setVapidDetails = jest.fn();
const sendNotification = jest.fn();
const pushSubscriptionUpdate = jest.fn();

jest.mock('web-push', () => ({
  __esModule: true,
  default: {
    setVapidDetails,
    sendNotification,
  },
}));

import { sendAssignmentPush } from './webPush';

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    pushSubscription: {
      update: pushSubscriptionUpdate,
    },
  },
}));

const subscription = {
  id: 10,
  endpoint: 'https://push.example/subscription',
  p256dh: 'key',
  auth: 'auth',
};

describe('sendAssignmentPush', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      VAPID_PUBLIC_KEY: 'public',
      VAPID_PRIVATE_KEY: 'private',
    };
    setVapidDetails.mockReset();
    sendNotification.mockReset().mockResolvedValue(undefined);
    pushSubscriptionUpdate.mockReset().mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = env;
    jest.restoreAllMocks();
  });

  it('sends a push payload with configured VAPID details', async () => {
    await expect(
      sendAssignmentPush(subscription as never, {
        type: 'assignment-change',
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        title: 'Assignment update',
        body: 'Assignments changed',
      })
    ).resolves.toEqual({ success: true, error: null });

    expect(setVapidDetails).toHaveBeenCalledWith(
      'mailto:notifications@example.com',
      'public',
      'private'
    );
    expect(sendNotification).toHaveBeenCalledWith(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        type: 'assignment-change',
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        title: 'Assignment update',
        body: 'Assignments changed',
      })
    );
  });

  it('returns a failed result when VAPID config is missing', async () => {
    delete process.env.VAPID_PUBLIC_KEY;

    await expect(
      sendAssignmentPush(subscription as never, {
        type: 'assignment-change',
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        title: 'Assignment update',
        body: 'Assignments changed',
      })
    ).resolves.toEqual({
      success: false,
      error: {
        message: 'VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be configured',
      },
    });
    expect(pushSubscriptionUpdate).not.toHaveBeenCalled();
  });

  it('disables subscriptions rejected as gone', async () => {
    sendNotification.mockRejectedValue(
      Object.assign(new Error('Gone'), { statusCode: 410 })
    );

    await expect(
      sendAssignmentPush(subscription as never, {
        type: 'assignment-change',
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        title: 'Assignment update',
        body: 'Assignments changed',
      })
    ).resolves.toEqual({
      success: false,
      error: {
        message: 'Gone',
        statusCode: 410,
      },
    });
    expect(pushSubscriptionUpdate).toHaveBeenCalledWith({
      where: {
        id: subscription.id,
      },
      data: {
        disabledAt: expect.any(Date),
      },
    });
  });
});
