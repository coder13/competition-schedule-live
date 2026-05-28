import type { WcifPayload } from '../lib/assignmentSnapshots';
import { runWithConcurrency } from '../lib/runWithConcurrency';
import { PushSubscription } from '../prisma/generated/client';
import { getFlatActivities } from '../scheduler/utils';
import { deliverAssignmentPush } from './assignmentPushDeliveries';
import { competitionGroupsPersonUrl } from './competitionGroupsUrls';

const competitionStartReminderWindowMs = 24 * 60 * 60 * 1000;

export type CompetitionStartReminderTargets = Map<number, PushSubscription[]>;

const createCompetitionStartReminderDedupeKey = (
  competitionId: string,
  wcaUserId: number,
  earliestStartTime: Date
) =>
  `competition-start-reminder:${competitionId}:${wcaUserId}:${earliestStartTime.toISOString()}`;

const createCompetitionStartReminderPayload = (
  competitionId: string,
  competitionName: string | null | undefined,
  wcaUserId: number,
  earliestStartTime: Date
) => ({
  type: 'competition-start-reminder' as const,
  competitionId,
  wcaUserId,
  startsAt: earliestStartTime.toISOString(),
  title: 'Competition tomorrow',
  body: `${competitionName ?? competitionId} starts within 24 hours.`,
  url: competitionGroupsPersonUrl(competitionId, wcaUserId),
  dedupeKey: createCompetitionStartReminderDedupeKey(
    competitionId,
    wcaUserId,
    earliestStartTime
  ),
});

export const getEarliestCompetitionStartTime = (wcif: WcifPayload) => {
  if (!wcif.schedule) {
    return null;
  }

  const earliestStartTime = getFlatActivities(wcif.schedule).reduce<
    number | null
  >((earliest, activity) => {
    const startTime = new Date(activity.startTime).getTime();
    if (!Number.isFinite(startTime)) {
      return earliest;
    }

    if (earliest === null || startTime < earliest) {
      return startTime;
    }

    return earliest;
  }, null);

  return earliestStartTime === null ? null : new Date(earliestStartTime);
};

export const shouldSendCompetitionStartReminder = (
  earliestStartTime: Date,
  now: Date
) =>
  earliestStartTime.getTime() > now.getTime() &&
  earliestStartTime.getTime() <=
    now.getTime() + competitionStartReminderWindowMs;

export const deliverCompetitionStartReminders = async ({
  competitionId,
  competitionName,
  targets,
  earliestStartTime,
  concurrency,
}: {
  competitionId: string;
  competitionName: string | null | undefined;
  targets: CompetitionStartReminderTargets;
  earliestStartTime: Date;
  concurrency: number;
}) => {
  const deliveries = [...targets.entries()].flatMap(
    ([wcaUserId, subscriptions]) =>
      subscriptions.map((subscription) => ({
        subscription,
        wcaUserId,
      }))
  );

  await runWithConcurrency(
    deliveries,
    async ({ subscription, wcaUserId }) => {
      const dedupeKey = createCompetitionStartReminderDedupeKey(
        competitionId,
        wcaUserId,
        earliestStartTime
      );

      return deliverAssignmentPush({
        subscription,
        competitionId,
        wcaUserId,
        dedupeKey,
        payload: createCompetitionStartReminderPayload(
          competitionId,
          competitionName,
          wcaUserId,
          earliestStartTime
        ),
      });
    },
    concurrency
  );
};
