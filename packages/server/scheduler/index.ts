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
  entry.headsUpJob?.cancel();

  for (const [jobKey, jobEntry] of CompetitionActivitiesJobsMap.entries()) {
    if (jobEntry.job === entry.job) {
      CompetitionActivitiesJobsMap.delete(jobKey);
    }
  }
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

  competitions.forEach(async (competition) => {
    await determineAndScheduleCompetition(competition);
  });

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

  activities.forEach(async (activity) => {
    console.log(
      'Scheduling',
      competitionActivityKey(activity.competitionId, activity.activityId)
    );

    const scheduledStartIsFuture = Boolean(
      activity.scheduledStartTime &&
        new Date(activity.scheduledStartTime).getTime() > Date.now()
    );
    const scheduledEndIsFuture = Boolean(
      activity.scheduledEndTime &&
        new Date(activity.scheduledEndTime).getTime() > Date.now()
    );

    if (scheduledStartIsFuture || scheduledEndIsFuture) {
      void scheduleActivity(activity);
    } else {
      console.log('Activity is in the past', activity);
    }
  });
}

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
        193,
        'Competition not found, really fucking weird',
        competitionId
      );
      return;
    }

    void determineAndScheduleCompetition(updatedCompetition);
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
    await sendActivityHeadsUpPush(
      competitionId,
      startActivities.map((activity) => activity.id),
      startTime
    );
  });
}

export async function scheduleActivity(activity: ActivityHistory) {
  cancelScheduledActivityJob(activity.competitionId, activity.activityId);

  if (activity.scheduledStartTime) {
    const startTime = new Date(activity.scheduledStartTime);
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
    const job = schedule.scheduleJob(
      startTime,
      async () => {
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
          void determineAndScheduleCompetition(comp);
        }
      }
    );

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
    const job = schedule.scheduleJob(
      new Date(activity.scheduledEndTime),
      async () => {
        await activitiesController.stopActivity(
          activity.competitionId,
          activity.activityId
        );
        cancelScheduledActivityJob(activity.competitionId, activity.activityId);

        // If this is the last activity that ends, we should determine the next activities to start.

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
          void determineAndScheduleCompetition(comp);
        }
      }
    );

    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(activity.competitionId, activity.activityId),
      {
        job,
        endTime: new Date(activity.scheduledEndTime),
      }
    );
  }
}
