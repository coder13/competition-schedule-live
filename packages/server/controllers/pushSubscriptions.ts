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

export interface PushSubscriptionSessionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  externalSubject: string;
  pushSubscriptionId: number;
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

export const updateCompetitionGroupsPushSubscriptionSession = async ({
  endpoint,
  p256dh,
  auth,
  externalSubject,
  pushSubscriptionId,
  watches,
}: PushSubscriptionSessionInput) =>
  prisma.$transaction(async (tx) => {
    const existingSubscription = await tx.pushSubscription.findFirstOrThrow({
      where: {
        id: pushSubscriptionId,
        source: PushSubscriptionSource.competitiongroups,
        externalSubject,
        disabledAt: null,
      },
    });

    const subscription = await tx.pushSubscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        endpoint,
        p256dh,
        auth,
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
        source: PushSubscriptionSource.competitiongroups,
        externalSubject,
        disabledAt: null,
      },
      include: {
        watches: true,
      },
    });
  });

export const disableCompetitionGroupsPushSubscriptionSession = async (
  pushSubscriptionId: number,
  externalSubject: string
) =>
  prisma.pushSubscription.updateMany({
    where: {
      id: pushSubscriptionId,
      source: PushSubscriptionSource.competitiongroups,
      externalSubject,
      disabledAt: null,
    },
    data: {
      disabledAt: new Date(),
    },
  });
