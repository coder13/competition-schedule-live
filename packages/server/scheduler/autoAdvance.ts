import type { Activity } from '@wca/helpers';

export interface AutoAdvanceActivityHistory {
  activityId: number;
  startTime: Date | null;
  endTime: Date | null;
  scheduledStartTime?: Date | null;
  scheduledEndTime?: Date | null;
}

export interface AutoAdvancePlan {
  jobTime: Date;
  stopActivities: Activity[];
  startActivities: Activity[];
}

const getActivityStart = (activity: Activity) =>
  new Date(activity.startTime).getTime();

const getActivityEnd = (activity: Activity) =>
  new Date(activity.endTime).getTime();

const getActivityDuration = (activity: Activity) =>
  getActivityEnd(activity) - getActivityStart(activity);

const applyDelay = (time: number, delaySeconds: number) =>
  time + delaySeconds * 1000;

const atOrAfterNow = (time: number, now: Date) =>
  new Date(Math.max(time, now.getTime()));

const findHistory = (
  activity: Activity,
  activityHistory: AutoAdvanceActivityHistory[]
) => activityHistory.find((history) => history.activityId === activity.id);

const getPlannedStart = (
  activity: Activity,
  activityHistory: AutoAdvanceActivityHistory[]
) =>
  findHistory(activity, activityHistory)?.scheduledStartTime?.getTime() ??
  getActivityStart(activity);

const isDone = (
  activity: Activity,
  activityHistory: AutoAdvanceActivityHistory[]
) => {
  const history = findHistory(activity, activityHistory);
  return Boolean(history?.startTime && history.endTime);
};

const getRunningActivities = (
  activities: Activity[],
  activityHistory: AutoAdvanceActivityHistory[]
) =>
  activityHistory
    .filter((history) => history.startTime && !history.endTime)
    .map((history) =>
      activities.find((activity) => activity.id === history.activityId)
    )
    .filter((activity): activity is Activity => Boolean(activity));

const getUnstartedActivities = (
  activities: Activity[],
  activityHistory: AutoAdvanceActivityHistory[]
) =>
  activities
    .filter((activity) => !isDone(activity, activityHistory))
    .filter(
      (activity) =>
        !activityHistory.some(
          (history) =>
            history.activityId === activity.id &&
            history.startTime &&
            !history.endTime
        )
    )
    .sort(
      (a, b) =>
        getPlannedStart(a, activityHistory) -
        getPlannedStart(b, activityHistory)
    );

export function determineAutoAdvancePlan({
  activities,
  activityHistory,
  autoAdvanceDelaySeconds,
  now,
}: {
  activities: Activity[];
  activityHistory: AutoAdvanceActivityHistory[];
  autoAdvanceDelaySeconds: number;
  now: Date;
}): AutoAdvancePlan | null {
  const runningActivities = getRunningActivities(activities, activityHistory);
  const unstartedActivities = getUnstartedActivities(activities, activityHistory);

  if (!unstartedActivities.length && !runningActivities.length) {
    return null;
  }

  if (!runningActivities.length) {
    const queuedUnstartedActivities = unstartedActivities.filter((activity) =>
      Boolean(findHistory(activity, activityHistory)?.scheduledStartTime)
    );
    const startCandidates = queuedUnstartedActivities.length
      ? queuedUnstartedActivities
      : unstartedActivities;
    const nextStartTime = getPlannedStart(startCandidates[0], activityHistory);

    return {
      jobTime: atOrAfterNow(
        applyDelay(nextStartTime, autoAdvanceDelaySeconds),
        now
      ),
      stopActivities: [],
      startActivities: startCandidates.filter(
        (activity) =>
          getPlannedStart(activity, activityHistory) === nextStartTime
      ),
    };
  }

  const latestRunningEndTime = Math.max(
    ...runningActivities.map((activity) => {
      const history = findHistory(activity, activityHistory);
      if (history?.scheduledEndTime) {
        return history.scheduledEndTime.getTime();
      }

      const startTime =
        history?.startTime?.getTime() ?? getActivityStart(activity);
      return startTime + getActivityDuration(activity);
    })
  );
  const stopJobTime = applyDelay(latestRunningEndTime, autoAdvanceDelaySeconds);
  const earliestRunningStartTime = Math.min(
    ...runningActivities.map(getActivityStart)
  );
  const futureUnstartedActivities = unstartedActivities.filter(
    (activity) =>
      getPlannedStart(activity, activityHistory) > earliestRunningStartTime
  );

  if (!futureUnstartedActivities.length) {
    return {
      jobTime: atOrAfterNow(stopJobTime, now),
      stopActivities: runningActivities,
      startActivities: [],
    };
  }

  const nextStartTime = getPlannedStart(
    futureUnstartedActivities[0],
    activityHistory
  );
  const nextStartJobTime = applyDelay(nextStartTime, autoAdvanceDelaySeconds);

  if (nextStartJobTime > stopJobTime) {
    return {
      jobTime: atOrAfterNow(stopJobTime, now),
      stopActivities: runningActivities,
      startActivities: [],
    };
  }

  return {
    jobTime: atOrAfterNow(Math.max(stopJobTime, nextStartJobTime), now),
    stopActivities: runningActivities,
    startActivities: futureUnstartedActivities.filter(
      (activity) => getPlannedStart(activity, activityHistory) === nextStartTime
    ),
  };
}
