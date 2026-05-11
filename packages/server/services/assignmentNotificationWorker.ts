import prisma from '../db';
import { createAssignmentSnapshot } from '../lib/assignmentSnapshots';
import {
  PushDeliveryStatus,
  PushSubscription,
} from '../prisma/generated/client';
import { sendAssignmentPush } from './webPush';
import { fetchWcif } from './wcif';

interface WatchTarget {
  competitionId: string;
  wcaUserId: number;
}

const groupTargetsByCompetition = (targets: WatchTarget[]) =>
  targets.reduce<Record<string, number[]>>((acc, target) => {
    acc[target.competitionId] = [
      ...(acc[target.competitionId] ?? []),
      target.wcaUserId,
    ];
    return acc;
  }, {});

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
  assignmentsHash: string
) => `assignment-change:${competitionId}:${wcaUserId}:${assignmentsHash}`;

const createPayload = (
  competitionId: string,
  wcaUserId: number,
  assignmentsHash: string
) => ({
  type: 'assignment-change' as const,
  competitionId,
  wcaUserId,
  title: 'Assignment update',
  body: 'Your competition assignments changed. Open competitiongroups.com to review the latest groups.',
  url: competitionGroupsUrl(competitionId, wcaUserId),
  dedupeKey: createDedupeKey(competitionId, wcaUserId, assignmentsHash),
});

const getActiveTargets = async (): Promise<WatchTarget[]> =>
  prisma.assignmentWatch.findMany({
    distinct: ['competitionId', 'wcaUserId'],
    select: {
      competitionId: true,
      wcaUserId: true,
    },
    where: {
      pushSubscription: {
        disabledAt: null,
      },
    },
  });

const getSubscriptionsForTarget = async (
  competitionId: string,
  wcaUserId: number
): Promise<PushSubscription[]> => {
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

const deliverAssignmentChange = async (
  subscription: PushSubscription,
  competitionId: string,
  wcaUserId: number,
  assignmentsHash: string
) => {
  const dedupeKey = createDedupeKey(competitionId, wcaUserId, assignmentsHash);
  const existingDelivery = await prisma.pushDelivery.findFirst({
    where: {
      pushSubscriptionId: subscription.id,
      dedupeKey,
    },
  });

  if (existingDelivery) {
    return;
  }

  const delivery = await prisma.pushDelivery.create({
    data: {
      pushSubscriptionId: subscription.id,
      competitionId,
      wcaUserId,
      dedupeKey,
      status: PushDeliveryStatus.pending,
    },
  });

  const result = await sendAssignmentPush(
    subscription,
    createPayload(competitionId, wcaUserId, assignmentsHash)
  );

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
};

export const runAssignmentNotificationPoll = async () => {
  const targets = await getActiveTargets();
  const targetsByCompetition = groupTargetsByCompetition(targets);

  for (const [competitionId, wcaUserIds] of Object.entries(
    targetsByCompetition
  )) {
    const wcif = await fetchWcif(competitionId);

    for (const wcaUserId of wcaUserIds) {
      const nextSnapshot = createAssignmentSnapshot(wcif, wcaUserId);
      if (!nextSnapshot) {
        continue;
      }

      const previousSnapshot = await prisma.assignmentSnapshot.findUnique({
        where: {
          competitionId_wcaUserId: {
            competitionId,
            wcaUserId,
          },
        },
      });

      await prisma.assignmentSnapshot.upsert({
        where: {
          competitionId_wcaUserId: {
            competitionId,
            wcaUserId,
          },
        },
        update: {
          assignmentsHash: nextSnapshot.assignmentsHash,
        },
        create: nextSnapshot,
      });

      if (
        !previousSnapshot ||
        previousSnapshot.assignmentsHash === nextSnapshot.assignmentsHash
      ) {
        continue;
      }

      const subscriptions = await getSubscriptionsForTarget(
        competitionId,
        wcaUserId
      );

      await Promise.all(
        subscriptions.map(async (subscription) =>
          deliverAssignmentChange(
            subscription,
            competitionId,
            wcaUserId,
            nextSnapshot.assignmentsHash
          )
        )
      );
    }
  }
};

export const startAssignmentNotificationWorker = () => {
  if (process.env.ASSIGNMENT_PUSH_ENABLED !== 'true') {
    console.info('Assignment push worker disabled');
    return;
  }

  const intervalMs = Number(process.env.ASSIGNMENT_POLL_INTERVAL_MS) || 300000;
  let running = false;

  const poll = async () => {
    if (running) {
      return;
    }

    running = true;
    try {
      await runAssignmentNotificationPoll();
    } catch (e) {
      console.error(e);
    } finally {
      running = false;
    }
  };

  void poll();
  setInterval(() => {
    void poll();
  }, intervalMs);
};
