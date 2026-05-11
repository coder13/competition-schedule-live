import prisma from '../db';
import { PushSubscriptionSource } from '../prisma/generated/client';

export interface PushWatchInput {
  competitionId: string;
  wcaUserId: number;
}

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  externalSubject: string;
  watches: PushWatchInput[];
}

export const upsertCompetitionGroupsPushSubscription = async ({
  endpoint,
  p256dh,
  auth,
  externalSubject,
  watches,
}: PushSubscriptionInput) =>
  prisma.$transaction(async (tx) => {
    const subscription = await tx.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        p256dh,
        auth,
        source: PushSubscriptionSource.competitiongroups,
        externalSubject,
        disabledAt: null,
      },
      create: {
        endpoint,
        p256dh,
        auth,
        source: PushSubscriptionSource.competitiongroups,
        externalSubject,
      },
    });

    await tx.assignmentWatch.deleteMany({
      where: {
        pushSubscriptionId: subscription.id,
      },
    });

    if (watches.length) {
      await tx.assignmentWatch.createMany({
        data: watches.map((watch) => ({
          pushSubscriptionId: subscription.id,
          competitionId: watch.competitionId,
          wcaUserId: watch.wcaUserId,
        })),
        skipDuplicates: true,
      });
    }

    return tx.pushSubscription.findFirstOrThrow({
      where: {
        id: subscription.id,
      },
      include: {
        watches: true,
      },
    });
  });

export const disableCompetitionGroupsPushSubscription = async (
  endpoint: string,
  externalSubject: string
) =>
  prisma.pushSubscription.updateMany({
    where: {
      endpoint,
      source: PushSubscriptionSource.competitiongroups,
      externalSubject,
    },
    data: {
      disabledAt: new Date(),
    },
  });
