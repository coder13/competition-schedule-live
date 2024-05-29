import schedule from 'node-schedule';
import { Activity } from '@wca/helpers';
import prisma from '../db';
import WcaApi from '../graphql/datasources/WcaApi';
import {
  ActivityHistory,
  Competition,
  Status,
} from '../prisma/generated/client';
import { WCA_ORIGIN } from '../env';
import { getFlatActivities } from './utils';
import * as activitiesController from '../controllers/activities';

export const CompetitionJobsMap = new Map<string, schedule.Job>();

const wcaApi = new WcaApi(WCA_ORIGIN);

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
    await scheduleNextActivity(competition);
  });
}

export async function scheduleNextActivity(
  competition: Competition & {
    activityHistory: ActivityHistory[];
  }
) {
  const compSchedule = await wcaApi.getSchedule(competition.id);
  if (!compSchedule) {
    console.error('No schedule found for competition', competition.id);
    return;
  }

  const allFlatActivities = getFlatActivities(compSchedule);

  const unstartedActivities = allFlatActivities.filter((activity) => {
    const liveActivity = competition.activityHistory.find(
      (a) => a.activityId === activity.id
    );
    // If the activity has no start time, it hasn't started yet.
    // If the activity has a start time but no end time, it's currently running.
    if (
      !liveActivity ||
      !!liveActivity?.startTime ||
      !!(liveActivity.startTime && !liveActivity.endTime)
    ) {
      return true;
    }

    // If the activity has a start time and it's in the future, it hasn't started yet.
    return activity.startTime > new Date().toISOString();
  });

  if (unstartedActivities.length === 0) {
    // This means all activities have started and ended.
    // We should check if the competition has ended and update the status accordingly.
    return;
  }

  const currentActivities = competition.activityHistory.filter(
    (activity) => activity.startTime && !activity.endTime
  );

  const nextActivityStartTime = unstartedActivities.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )[0].startTime;
  const nextActivities = unstartedActivities.filter(
    (activity) => activity.startTime === nextActivityStartTime
  );

  if (currentActivities.length === 0) {
    // This could mean nothing has been started or there just isn't anything currently running.
    // This just means we should figure out what the next activity should be and combine it with the current schedule delay.

    const startInDelay = new Date(nextActivityStartTime).getTime() - Date.now();

    if (startInDelay < 0) {
      console.error('Next activity is in the past', nextActivityStartTime);
      return;
    }

    const jobStartTime = new Date(
      new Date(nextActivityStartTime).getTime() +
        Number(competition.autoAdvanceDelay)
    );

    startAndStopActivities(jobStartTime, [], nextActivities);
    return;
  }

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

  // If we do have ongoing activities, we want to start the next activities when the current activities duration has elapsed.

  const totalDuration = currentActivities.reduce((acc, activity) => {
    const scheduleActivity = allFlatActivities.find(
      (a) => a.id === activity.activityId
    );
    return (
      Number(acc) +
      new Date(scheduleActivity!.endTime).getTime() -
      new Date(scheduleActivity!.startTime).getTime()
    );
  }, 0);

  const elapsedDuration = currentActivities.reduce((acc, activity) => {
    const scheduleActivity = allFlatActivities.find(
      (a) => a.id === activity.activityId
    );
    return (
      Number(acc) +
      new Date().getTime() -
      new Date(scheduleActivity!.startTime).getTime()
    );
  }, 0);

  const remainingDuration = totalDuration - elapsedDuration;
  if (remainingDuration < 0) {
    // Woah we're behind schedule.
    // We should probably start the next activities immediately.

    const startInDelay = new Date(nextActivityStartTime).getTime() - Date.now();

    if (startInDelay < 0) {
      console.error('Next activity is in the past', nextActivityStartTime);
      return;
    }

    const jobStartTime = new Date(
      new Date(nextActivityStartTime).getTime() +
        Number(competition.autoAdvanceDelay)
    );

    startAndStopActivities(jobStartTime, activitiesToStop, nextActivities);
    return;
  }

  const startInDelay = new Date(nextActivityStartTime).getTime() - Date.now();

  if (startInDelay < 0) {
    console.error('Next activity is in the past', nextActivityStartTime);
    return;
  }

  const jobStartTime = new Date(
    new Date(nextActivityStartTime).getTime() +
      Number(competition.autoAdvanceDelay) +
      Number(remainingDuration)
  );

  startAndStopActivities(jobStartTime, activitiesToStop, nextActivities);

  function startAndStopActivities(
    startTime: Date,
    stopActivities: Activity[],
    startActivities: Activity[]
  ) {
    const job = schedule.scheduleJob(startTime, async () => {
      stopActivities.forEach((activity) => {
        console.log(`Stopping activity ${activity.id} ${activity.name}`);
      });
      startActivities.forEach((activity) => {
        console.log(`Starting activity ${activity.id} ${activity.name}`);
      });

      await Promise.all([
        ...stopActivities.map(async (activity) =>
          activitiesController.stopActivity(competition.id, activity.id)
        ),
        ...startActivities.map(async (activity) =>
          activitiesController.stopActivity(competition.id, activity.id)
        ),
      ]);

      const updatedCompetition = await prisma.competition.findFirst({
        where: {
          id: competition.id,
        },
        include: {
          activityHistory: true,
        },
      });

      if (!updatedCompetition) {
        console.error(
          193,
          'Competition not found, really fucking weird',
          competition.id
        );
        return;
      }

      void scheduleNextActivity(updatedCompetition);
    });
    CompetitionJobsMap.set(competition.id, job);
    console.log('Started ', job.name, 'for', jobStartTime.toLocaleString());
  }
}
