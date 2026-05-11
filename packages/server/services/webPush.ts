import webPush from 'web-push';
import prisma from '../db';
import { PushSubscription } from '../prisma/generated/client';

export interface AssignmentPushPayload {
  type: 'assignment-change';
  competitionId: string;
  wcaUserId: number;
  title: string;
  body: string;
  url?: string;
}

const configureWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be configured');
  }

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:notifications@example.com',
    publicKey,
    privateKey
  );
};

const shouldDisableSubscription = (error: unknown) => {
  const statusCode = (error as { statusCode?: number }).statusCode;
  return statusCode === 404 || statusCode === 410;
};

export const sendAssignmentPush = async (
  subscription: PushSubscription,
  payload: AssignmentPushPayload
) => {
  try {
    configureWebPush();

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );

    return { success: true, error: null };
  } catch (e) {
    if (shouldDisableSubscription(e)) {
      await prisma.pushSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          disabledAt: new Date(),
        },
      });
    }

    console.error(e);

    return {
      success: false,
      error: {
        message: e instanceof Error ? e.message : 'Unknown Web Push error',
        ...((e as { statusCode?: number }).statusCode && {
          statusCode: (e as { statusCode?: number }).statusCode,
        }),
      },
    };
  }
};
