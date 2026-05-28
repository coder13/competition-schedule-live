import schedule from 'node-schedule';
import { Activity } from '@wca/helpers';
import prisma from '../db';
import WcaApi from '../graphql/datasources/WcaApi';
import {
  ActivityHistory,
  Competition,
  Status,
} from '../prisma/generated/client';
import type { Prisma } from '../prisma/generated/client';
import { WCA_ORIGIN } from '../env';
import { getFlatActivities } from './utils';
import * as activitiesController from '../controllers/activities';
import { determineAutoAdvancePlan } from './autoAdvance';
import { sendActivityHeadsUpPush } from '../services/activityHeadsUpNotifications';
import { settleWithConcurrency } from '../lib/runWithConcurrency';

export const CompetitionActivitiesJobsMap = new Map<
  string,
  {
    job: schedule.Job;
    headsUpJob?: schedule.Job;
  } & (
    | {
        endTime: Date;
      }
    | {
        startTime: Date;
      }
  )
>();
const competitionActivityKey = (competitionId: string, activityId: number) =>
  `${competitionId}_${activityId}`;

const positiveIntFromEnv = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const schedulerInitConcurrency = () =>
  positiveIntFromEnv('SCHEDULER_INIT_CONCURRENCY', 4);

export function cancelScheduledActivityJob(
  competitionId: string,
  activityId: number
) {
  const key = competitionActivityKey(competitionId, activityId);
  const entry = CompetitionActivitiesJobsMap.get(key);

  if (!entry) {
    return;
  }

  entry.job.cancel();

  const headsUpJobs = new Set<schedule.Job>();

  for (const [jobKey, jobEntry] of CompetitionActivitiesJobsMap.entries()) {
    if (jobEntry.job === entry.job) {
      if (jobEntry.headsUpJob) {
        headsUpJobs.add(jobEntry.headsUpJob);
      }
      CompetitionActivitiesJobsMap.delete(jobKey);
    }
  }

  headsUpJobs.forEach((headsUpJob) => headsUpJob.cancel());
}

export function cancelCompetitionActivityJobs(competitionId: string) {
  for (const key of CompetitionActivitiesJobsMap.keys()) {
    if (key.startsWith(`${competitionId}_`)) {
      cancelScheduledActivityJob(
        competitionId,
        Number(key.slice(competitionId.length + 1))
      );
    }
  }
}

export async function shutdownScheduler() {
  CompetitionActivitiesJobsMap.clear();
  await schedule.gracefulShutdown();
}

const wcaApi = new WcaApi(WCA_ORIGIN);

const activityHistoryClause: Prisma.Competition$activityHistoryArgs = {
  where: {
    startTime: {
      not: null,
    },
    scheduledEndTime: null,
    scheduledStartTime: null,
  },
};

export async function initScheduler() {
  console.log('Initializing scheduler');
  const competitions = await prisma.competition.findMany({
    where: {
      status: {
        not: Status.FINISHED,
      },
      autoAdvance: true,
    },
    include: {
      activityHistory: true,
    },
  });

  const competitionResults = await settleWithConcurrency(
    competitions,
    async (competition) => determineAndScheduleCompetition(competition),
    schedulerInitConcurrency()
  );
  logRejectedResults(
    'Failed to initialize auto-advance competition',
    competitionResults
  );

  const activities = await prisma.activityHistory.findMany({
    where: {
      OR: [
        {
          scheduledEndTime: {
            not: null,
          },
        },
        {
          scheduledStartTime: {
            not: null,
          },
        },
      ],
    },
  });

  const activityResults = await settleWithConcurrency(
    activities,
    async (activity) => {
      console.log(
        'Scheduling',
        competitionActivityKey(activity.competitionId, activity.activityId)
      );

      await scheduleActivity(activity);
    },
    schedulerInitConcurrency()
  );
  logRejectedResults(
    'Failed to initialize scheduled activity',
    activityResults
  );
}

const logRejectedResults = (
  message: string,
  results: Array<PromiseSettledResult<unknown>>
) => {
  results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    .forEach((result) => {
      console.error(message, result.reason);
    });
};

export async function determineAndScheduleCompetition(
  competition: Competition & {
    activityHistory: ActivityHistory[];
  }
) {
  try {
    const compSchedule = await wcaApi.getSchedule(competition.id);
    if (!compSchedule) {
      throw new Error('No schedule found');
    }
    const allFlatActivities = getFlatActivities(compSchedule);

    const plan = determineAutoAdvancePlan({
      activities: allFlatActivities,
      activityHistory: competition.activityHistory,
      autoAdvanceDelaySeconds: competition.autoAdvanceDelay,
      now: new Date(),
    });

    if (!plan) {
      return;
    }

    await startAndStopActivities(
      competition.id,
      plan.jobTime,
      plan.stopActivities,
      plan.startActivities
    );
  } catch (e) {
    console.error(e);
  }
}

async function startAndStopActivities(
  competitionId: string,
  jobTime: Date,
  stopActivities: Activity[],
  startActivities: Activity[]
) {
  if (jobTime < new Date()) {
    console.error(
      'Cannot create job because start time is in the past',
      jobTime
    );
    return;
  }

  const job = schedule.scheduleJob(jobTime, async () => {
    try {
      stopActivities.forEach((activity) => {
        console.log(`Stopping activity ${activity.id} ${activity.name}`);
      });
      startActivities.forEach((activity) => {
        console.log(`Starting activity ${activity.id} ${activity.name}`);
      });

      await Promise.all([
        ...stopActivities.map(async (activity) =>
          activitiesController.stopActivity(competitionId, activity.id)
        ),
        ...startActivities.map(async (activity) =>
          activitiesController.startActivity(competitionId, activity.id)
        ),
      ]);
      [...stopActivities, ...startActivities].forEach((activity) => {
        cancelScheduledActivityJob(competitionId, activity.id);
      });

      const updatedCompetition = await prisma.competition.findFirst({
        where: {
          id: competitionId,
          autoAdvance: true,
          activityHistory: {
            some: {
              scheduledEndTime: null,
              scheduledStartTime: null,
            },
          },
        },
        include: {
          activityHistory: activityHistoryClause,
        },
      });

      if (!updatedCompetition) {
        console.error(
          'Competition not found while rescheduling',
          competitionId
        );
        return;
      }

      await determineAndScheduleCompetition(updatedCompetition);
    } catch (e) {
      console.error('Scheduled auto-advance job failed', {
        competitionId,
        activityIds: [...stopActivities, ...startActivities].map(
          (activity) => activity.id
        ),
        error: e,
      });
    }
  });

  if (!job) {
    throw new Error('Job could not be created');
  }

  const headsUpJob = scheduleActivityHeadsUp(
    competitionId,
    startActivities,
    jobTime
  );

  stopActivities.forEach((stopActivity) => {
    cancelScheduledActivityJob(competitionId, stopActivity.id);
    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(competitionId, stopActivity.id),
      {
        job,
        endTime: jobTime,
      }
    );
  });
  startActivities.forEach((startActivity) => {
    cancelScheduledActivityJob(competitionId, startActivity.id);
    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(competitionId, startActivity.id),
      {
        job,
        headsUpJob,
        startTime: jobTime,
      }
    );
  });
  await Promise.all([
    ...stopActivities.map(async (stopActivity) =>
      activitiesController.scheduleActivity(competitionId, stopActivity.id, {
        scheduledEndTime: jobTime,
      })
    ),
    ...startActivities.map(async (startActivity) =>
      activitiesController.scheduleActivity(competitionId, startActivity.id, {
        scheduledStartTime: jobTime,
      })
    ),
  ]);
  console.log('Scheduled ', job.name, 'for', jobTime.toLocaleString());
}

function scheduleActivityHeadsUp(
  competitionId: string,
  startActivities: Activity[],
  startTime: Date
) {
  if (!startActivities.length) {
    return undefined;
  }

  const headsUpTime = new Date(startTime.getTime() - 5 * 60 * 1000);
  if (headsUpTime <= new Date()) {
    return undefined;
  }

  return schedule.scheduleJob(headsUpTime, async () => {
    try {
      await sendActivityHeadsUpPush(
        competitionId,
        startActivities.map((activity) => activity.id),
        startTime
      );
    } catch (e) {
      console.error('Scheduled activity heads-up push failed', {
        competitionId,
        activityIds: startActivities.map((activity) => activity.id),
        error: e,
      });
    }
  });
}

const handleScheduledActivityStart = async (activity: ActivityHistory) => {
  await activitiesController.startActivity(
    activity.competitionId,
    activity.activityId
  );
  cancelScheduledActivityJob(activity.competitionId, activity.activityId);

  const comp = await prisma.competition.findFirst({
    where: {
      id: activity.competitionId,
      autoAdvance: true,
    },
    include: {
      activityHistory: true,
    },
  });

  if (comp) {
    await determineAndScheduleCompetition(comp);
  }
};

const handleScheduledActivityEnd = async (activity: ActivityHistory) => {
  await activitiesController.stopActivity(
    activity.competitionId,
    activity.activityId
  );
  cancelScheduledActivityJob(activity.competitionId, activity.activityId);

  // If this is the last activity that ends, determine the next activities to start.
  const comp = await prisma.competition.findFirst({
    where: {
      id: activity.competitionId,
      autoAdvance: true,
    },
    include: {
      activityHistory: {
        where: {
          startTime: {
            not: null,
          },
          scheduledEndTime: null,
          scheduledStartTime: null,
        },
      },
    },
  });

  if (!comp) {
    console.error('Competition not found', activity.competitionId);
    return;
  }
  if (!comp.activityHistory.length) {
    await determineAndScheduleCompetition(comp);
  }
};

export async function scheduleActivity(activity: ActivityHistory) {
  cancelScheduledActivityJob(activity.competitionId, activity.activityId);

  if (activity.scheduledStartTime) {
    const startTime = new Date(activity.scheduledStartTime);
    if (startTime <= new Date()) {
      await handleScheduledActivityStart(activity);
      return;
    }

    const headsUpJob = scheduleActivityHeadsUp(
      activity.competitionId,
      [
        {
          id: activity.activityId,
          name: '',
          activityCode: '',
          startTime: startTime.toISOString(),
          endTime: startTime.toISOString(),
          childActivities: [],
          extensions: [],
        },
      ],
      startTime
    );
    const job = schedule.scheduleJob(startTime, async () => {
      try {
        await handleScheduledActivityStart(activity);
      } catch (e) {
        console.error('Scheduled activity start failed', {
          competitionId: activity.competitionId,
          activityId: activity.activityId,
          error: e,
        });
      }
    });

    if (!job) {
      throw new Error('Scheduled activity start job could not be created');
    }

    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(activity.competitionId, activity.activityId),
      {
        job,
        headsUpJob,
        startTime,
      }
    );
  }

  if (activity.scheduledEndTime) {
    const endTime = new Date(activity.scheduledEndTime);
    if (endTime <= new Date()) {
      await handleScheduledActivityEnd(activity);
      return;
    }

    const job = schedule.scheduleJob(endTime, async () => {
      try {
        await handleScheduledActivityEnd(activity);
      } catch (e) {
        console.error('Scheduled activity end failed', {
          competitionId: activity.competitionId,
          activityId: activity.activityId,
          error: e,
        });
      }
    });

    if (!job) {
      throw new Error('Scheduled activity end job could not be created');
    }

    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(activity.competitionId, activity.activityId),
      {
        job,
        endTime,
      }
    );
  }
}
