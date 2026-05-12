import prisma from '../db';
import { PushDeliveryStatus } from '../prisma/generated/client';
import { sendAssignmentPush } from './webPush';

const competitionGroupsUrl = (competitionId: string, wcaUserId: number) => {
  const origin = process.env.COMPETITION_GROUPS_ORIGIN;
  if (!origin) {
    return undefined;
  }

  return `${origin.replace(/\/$/, '')}/competitions/${competitionId}/persons/${wcaUserId}`;
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

const getSubscriptionsForTarget = async (
  competitionId: string,
  wcaUserId: number
) => {
  const watches = await prisma.assignmentWatch.findMany({
    where: {
      competitionId,
      wcaUserId,
      pushSubscription: {
        disabledAt: null,
      },
    },
    include: {
      pushSubscription: true,
    },
  });

  return watches.map((watch) => watch.pushSubscription);
};

export const sendActivityHeadsUpPush = async (
  competitionId: string,
  activityIds: number[],
  startsAt: Date
) => {
  const targets = await getDelegateAndOrganizerTargets(competitionId);

  for (const target of targets) {
    const subscriptions = await getSubscriptionsForTarget(
      competitionId,
      target.userId
    );

    for (const subscription of subscriptions) {
      const dedupeKey = createDedupeKey(
        competitionId,
        target.userId,
        activityIds,
        startsAt
      );
      const existingDelivery = await prisma.pushDelivery.findFirst({
        where: {
          pushSubscriptionId: subscription.id,
          dedupeKey,
        },
      });

      if (existingDelivery) {
        continue;
      }

      const delivery = await prisma.pushDelivery.create({
        data: {
          pushSubscriptionId: subscription.id,
          competitionId,
          wcaUserId: target.userId,
          dedupeKey,
          status: PushDeliveryStatus.pending,
        },
      });

      const result = await sendAssignmentPush(subscription, {
        type: 'activity-heads-up',
        competitionId,
        activityIds,
        startsAt: startsAt.toISOString(),
        title: 'Activity starting soon',
        body: `${formatActivityCount(activityIds)} will start in 5 minutes.`,
        url: competitionGroupsUrl(competitionId, target.userId),
      });

      await prisma.pushDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: result.success
            ? PushDeliveryStatus.sent
            : PushDeliveryStatus.failed,
          error: result.error ?? undefined,
        },
      });
    }
  }
};
