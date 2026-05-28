import prisma from '../db';
import { PushSubscription } from '../prisma/generated/client';
import { sendAssignmentPush } from './webPush';
import { runWithConcurrency } from '../lib/runWithConcurrency';
import { claimPushDelivery, completePushDelivery } from './pushDeliveries';

const competitionGroupsUrl = (competitionId: string, wcaUserId: number) => {
  const origin = process.env.COMPETITION_GROUPS_ORIGIN;
  if (!origin) {
    return undefined;
  }

  return `${origin.replace(
    /\/$/,
    ''
  )}/competitions/${competitionId}/persons/${wcaUserId}`;
};

const createDedupeKey = (
  competitionId: string,
  wcaUserId: number,
  activityIds: number[],
  startsAt: Date
) =>
  `activity-heads-up:${competitionId}:${wcaUserId}:${activityIds
    .slice()
    .sort((a, b) => a - b)
    .join(',')}:${startsAt.toISOString()}`;

const formatActivityCount = (activityIds: number[]) =>
  activityIds.length === 1 ? 'An activity' : `${activityIds.length} activities`;

const getDelegateAndOrganizerTargets = async (competitionId: string) =>
  prisma.competitionAccess.findMany({
    distinct: ['userId'],
    where: {
      competitionId,
      roomId: 0,
    },
    select: {
      userId: true,
    },
  });

const pushDeliveryConcurrency = () => {
  const value = Number(process.env.ACTIVITY_HEADS_UP_DELIVERY_CONCURRENCY);
  return Number.isInteger(value) && value > 0 ? value : 10;
};

const getSubscriptionsByTarget = async (
  competitionId: string,
  wcaUserIds: number[]
) => {
  const watches = await prisma.assignmentWatch.findMany({
    where: {
      competitionId,
      wcaUserId: {
        in: wcaUserIds,
      },
      pushSubscription: {
        disabledAt: null,
      },
    },
    include: {
      pushSubscription: true,
    },
  });

  return watches.reduce<Record<number, typeof watches>>((acc, watch) => {
    acc[watch.wcaUserId] = [...(acc[watch.wcaUserId] ?? []), watch];
    return acc;
  }, {});
};

const sendActivityHeadsUpPushDelivery = async ({
  competitionId,
  activityIds,
  startsAt,
  targetUserId,
  subscription,
}: {
  competitionId: string;
  activityIds: number[];
  startsAt: Date;
  targetUserId: number;
  subscription: PushSubscription;
}) => {
  const dedupeKey = createDedupeKey(
    competitionId,
    targetUserId,
    activityIds,
    startsAt
  );
  const deliveryClaim = await claimPushDelivery({
    pushSubscriptionId: subscription.id,
    competitionId,
    wcaUserId: targetUserId,
    dedupeKey,
  });

  if (deliveryClaim.status !== 'claimed') {
    return;
  }

  const result = await sendAssignmentPush(subscription, {
    type: 'activity-heads-up',
    competitionId,
    activityIds,
    startsAt: startsAt.toISOString(),
    title: 'Activity starting soon',
    body: `${formatActivityCount(activityIds)} will start in 5 minutes.`,
    url: competitionGroupsUrl(competitionId, targetUserId),
  });

  await completePushDelivery(deliveryClaim.deliveryId, result);
};

export const sendActivityHeadsUpPush = async (
  competitionId: string,
  activityIds: number[],
  startsAt: Date
) => {
  const targets = await getDelegateAndOrganizerTargets(competitionId);
  if (!targets.length) {
    return;
  }

  const subscriptionsByTarget = await getSubscriptionsByTarget(
    competitionId,
    targets.map((target) => target.userId)
  );
  const deliveries = targets.flatMap((target) =>
    (subscriptionsByTarget[target.userId] ?? []).map((watch) => ({
      competitionId,
      activityIds,
      startsAt,
      targetUserId: target.userId,
      subscription: watch.pushSubscription,
    }))
  );

  await runWithConcurrency(
    deliveries,
    sendActivityHeadsUpPushDelivery,
    pushDeliveryConcurrency()
  );
};
