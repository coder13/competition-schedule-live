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

export const CompetitionActivitiesJobsMap = new Map<
  string,
  {
    job: schedule.Job;
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
      // fetch comps where no activity is currently scheduled
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

  console.log(79, activities);

  activities.forEach(async (activity) => {
    console.log(
      'Scheduling',
      competitionActivityKey(activity.competitionId, activity.activityId)
    );

    if (
      (activity.scheduledStartTime &&
        new Date(activity.scheduledStartTime).getTime() > Date.now()) ??
      (activity.scheduledEndTime &&
        new Date(activity.scheduledEndTime).getTime() > Date.now())
    ) {
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
    console.log(67, competition.activityHistory);

    const allFlatActivities = getFlatActivities(compSchedule);

    const unstartedActivities = allFlatActivities.filter((activity) => {
      const liveActivity = competition.activityHistory.find(
        (a) => a.activityId === activity.id
      );

      // This 100% is an unstarted activity
      if (!liveActivity) {
        return new Date(activity.startTime).getTime() >= Date.now();
      }

      console.log(activity, liveActivity);

      // This activity is done
      if (liveActivity.startTime && liveActivity.endTime) {
        return false;
      }

      // The activity had been started but got reset
      if (!liveActivity.startTime && !liveActivity.endTime) {
        return true;
      }

      // idk
      return false;
    });

    console.log(68, unstartedActivities);

    if (unstartedActivities.length === 0) {
      // This means all activities have started and ended.
      // We should check if the competition has ended and update the status accordingly.
      return;
    }

    const currentActivities = competition.activityHistory.filter(
      (activity) => activity.startTime && !activity.endTime
    );
    console.log(85, currentActivities);

    const nextActivityStartTime = unstartedActivities.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    )[0].startTime;
    const nextActivities = unstartedActivities.filter(
      (activity) => activity.startTime === nextActivityStartTime
    );

    // This just determines what activities should start given that nothing is on-going.

    if (!currentActivities || currentActivities.length === 0) {
      // This could mean nothing has been started or there just isn't anything currently running.
      // This just means we should figure out what the next activity should be and combine it with the current schedule delay.

      const jobStartTime = new Date(nextActivityStartTime);

      if (jobStartTime.getTime() < Date.now()) {
        console.error('Next activity is in the past', jobStartTime);
        console.error("I mean this shouldn't really happen");
        return;
      }

      console.log(
        'Starting activities',
        nextActivities.map((a) => a.name),
        'at',
        jobStartTime.toLocaleTimeString()
      );

      startAndStopActivities(competition.id, jobStartTime, [], nextActivities);
      return;
    }

    // There are some activities we need to stop before we can start the next activities.

    const activitiesToStop = currentActivities
      .map((activityHistory) => {
        const activity = allFlatActivities.find(
          (a) => a.id === activityHistory.activityId
        );

        if (!activity) {
          console.error(
            'Activity not found in schedule',
            activityHistory.activityId,
            competition.id
          );
          return null;
        }

        return activity;
      })
      .filter(Boolean) as Activity[];

    if (nextActivityStartTime > activitiesToStop[0].endTime) {
      // We can just worry about stopping the activities.
      console.log('We can just worry about stopping the activities');

      const jobStartTime = new Date(activitiesToStop[0].endTime);

      startAndStopActivities(
        competition.id,
        jobStartTime,
        activitiesToStop,
        []
      );
    }

    // If we do have ongoing activities, we want to start the next activities when the current activities duration has elapsed.

    const totalDuration = currentActivities.reduce((acc, activity) => {
      const scheduleActivity = allFlatActivities.find(
        (a) => a.id === activity.activityId
      );
      console.log(134, scheduleActivity);

      if (!scheduleActivity) {
        return 0;
      }

      return (
        Number(acc) +
        new Date(scheduleActivity.endTime).getTime() -
        new Date(scheduleActivity.startTime).getTime()
      );
    }, 0);

    const elapsedDuration = currentActivities.reduce((acc, activity) => {
      const scheduleActivity = allFlatActivities.find(
        (a) => a.id === activity.activityId
      );
      if (!scheduleActivity) {
        return 0;
      }

      return (
        Number(acc) +
        new Date().getTime() -
        new Date(scheduleActivity.startTime).getTime()
      );
    }, 0);

    const remainingDuration =
      (totalDuration - elapsedDuration) / currentActivities.length;

    if (remainingDuration < 0 || activitiesToStop.length === 0) {
      // Woah we're behind schedule.
      // We should probably start the next activities immediately.

      const startInDelay =
        new Date(nextActivityStartTime).getTime() - Date.now();

      if (startInDelay < 0) {
        console.error('Next activity is in the past', nextActivityStartTime);
        return;
      }

      const jobStartTime = new Date(new Date().getTime() + remainingDuration);

      startAndStopActivities(
        competition.id,
        jobStartTime,
        activitiesToStop,
        nextActivities
      );
      return;
    }

    if (!currentActivities[0].startTime) {
      return;
    }

    const startDelay =
      currentActivities[0].startTime.getTime() -
      new Date(activitiesToStop[0].startTime).getTime();

    const jobStartTime = Math.max(
      new Date(nextActivityStartTime).getTime(),
      new Date(
        new Date(nextActivityStartTime).getTime() + Number(startDelay)
      ).getTime()
    );

    startAndStopActivities(
      competition.id,
      new Date(jobStartTime),
      activitiesToStop,
      nextActivities
    );
  } catch (e) {
    console.error(e);
  }
}

function startAndStopActivities(
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

    const updatedCompetition = await prisma.competition.findFirst({
      where: {
        id: competitionId,
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

  stopActivities.forEach((stopActivity) => {
    void activitiesController.scheduleActivity(competitionId, stopActivity.id, {
      scheduledEndTime: jobTime,
    });
    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(competitionId, stopActivity.id),
      {
        job,
        endTime: jobTime,
      }
    );
  });
  startActivities.forEach((startActivity) => {
    void activitiesController.scheduleActivity(
      competitionId,
      startActivity.id,
      {
        scheduledStartTime: jobTime,
      }
    );
    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(competitionId, startActivity.id),
      {
        job,
        endTime: jobTime,
      }
    );
  });
  console.log('Scheduled ', job.name, 'for', jobTime.toLocaleString());
}

export async function scheduleActivity(activity: ActivityHistory) {
  if (activity.scheduledStartTime) {
    const job = schedule.scheduleJob(
      new Date(activity.scheduledStartTime),
      async () => {
        await activitiesController.startActivity(
          activity.competitionId,
          activity.activityId
        );
      }
    );

    CompetitionActivitiesJobsMap.set(
      competitionActivityKey(activity.competitionId, activity.activityId),
      {
        job,
        startTime: new Date(activity.scheduledStartTime),
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

        // If this is the last activity that ends, we should determine the next activities to start.

        const comp = await prisma.competition.findFirst({
          where: {
            id: activity.competitionId,
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
