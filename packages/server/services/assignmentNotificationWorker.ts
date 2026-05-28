import prisma from '../db';
import { createAssignmentSnapshot } from '../lib/assignmentSnapshots';
import { PushSubscription } from '../prisma/generated/client';
import { fetchWcif } from './wcif';
import { runWithConcurrency } from '../lib/runWithConcurrency';
import { deliverAssignmentPush } from './assignmentPushDeliveries';
import { competitionGroupsPersonUrl } from './competitionGroupsUrls';
import {
  deliverCompetitionStartReminders,
  getEarliestCompetitionStartTime,
  shouldSendCompetitionStartReminder,
} from './competitionStartReminders';

interface WatchTarget {
  competitionId: string;
  wcaUserId: number;
}

type ActiveWatch = WatchTarget & {
  pushSubscription: PushSubscription;
};

const positiveIntFromEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const assignmentCompetitionConcurrency = () =>
  positiveIntFromEnv('ASSIGNMENT_POLL_COMPETITION_CONCURRENCY', 2);

const assignmentDeliveryConcurrency = () =>
  positiveIntFromEnv('ASSIGNMENT_PUSH_DELIVERY_CONCURRENCY', 10);

const groupWatchesByCompetition = (watches: ActiveWatch[]) => {
  const competitions = new Map<string, Map<number, PushSubscription[]>>();

  watches.forEach((watch) => {
    const users =
      competitions.get(watch.competitionId) ??
      new Map<number, PushSubscription[]>();
    users.set(watch.wcaUserId, [
      ...(users.get(watch.wcaUserId) ?? []),
      watch.pushSubscription,
    ]);
    competitions.set(watch.competitionId, users);
  });

  return competitions;
};

const createAssignmentChangeDedupeKey = (
  competitionId: string,
  wcaUserId: number,
  assignmentsHash: string
) => `assignment-change:${competitionId}:${wcaUserId}:${assignmentsHash}`;

const createAssignmentChangePayload = (
  competitionId: string,
  wcaUserId: number,
  assignmentsHash: string
) => ({
  type: 'assignment-change' as const,
  competitionId,
  wcaUserId,
  title: 'Assignment update',
  body: 'Your competition assignments changed. Open competitiongroups.com to review the latest groups.',
  url: competitionGroupsPersonUrl(competitionId, wcaUserId),
  dedupeKey: createAssignmentChangeDedupeKey(
    competitionId,
    wcaUserId,
    assignmentsHash
  ),
});

const getActiveWatches = async (): Promise<ActiveWatch[]> =>
  prisma.assignmentWatch.findMany({
    where: {
      pushSubscription: {
        disabledAt: null,
      },
    },
    include: {
      pushSubscription: true,
    },
  });

const deliverAssignmentChange = async (
  subscription: PushSubscription,
  competitionId: string,
  wcaUserId: number,
  assignmentsHash: string
) => {
  const dedupeKey = createAssignmentChangeDedupeKey(
    competitionId,
    wcaUserId,
    assignmentsHash
  );

  return deliverAssignmentPush({
    subscription,
    competitionId,
    wcaUserId,
    dedupeKey,
    payload: createAssignmentChangePayload(
      competitionId,
      wcaUserId,
      assignmentsHash
    ),
  });
};

export const runAssignmentNotificationPoll = async (now = new Date()) => {
  const targetsByCompetition = groupWatchesByCompetition(
    await getActiveWatches()
  );

  await runWithConcurrency(
    [...targetsByCompetition.entries()],
    async ([competitionId, targets]) => {
      const wcif = await fetchWcif(competitionId);
      const earliestStartTime = getEarliestCompetitionStartTime(wcif);

      if (
        earliestStartTime &&
        shouldSendCompetitionStartReminder(earliestStartTime, now)
      ) {
        await deliverCompetitionStartReminders({
          competitionId,
          competitionName: wcif.name,
          targets,
          earliestStartTime,
          concurrency: assignmentDeliveryConcurrency(),
        });
      }

      for (const [wcaUserId, subscriptions] of targets.entries()) {
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

        if (
          !previousSnapshot ||
          previousSnapshot.assignmentsHash === nextSnapshot.assignmentsHash
        ) {
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
          continue;
        }

        const deliveryResults = await runWithConcurrency(
          subscriptions,
          async (subscription) =>
            deliverAssignmentChange(
              subscription,
              competitionId,
              wcaUserId,
              nextSnapshot.assignmentsHash
            ),
          assignmentDeliveryConcurrency()
        );

        if (deliveryResults.every(Boolean)) {
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
        }
      }
    },
    assignmentCompetitionConcurrency()
  );
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
  const interval = setInterval(() => {
    void poll();
  }, intervalMs);

  return () => {
    clearInterval(interval);
  };
};
