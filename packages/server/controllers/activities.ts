import prisma from '../db';
import { pubsub } from '../graphql/pubsub';

export const startActivity = async (
  competitionId: string,
  activityId: number
) => {
  const activity = await prisma.activityHistory.upsert({
    where: {
      competitionId_activityId: {
        competitionId,
        activityId,
      },
    },
    update: {
      startTime: new Date(),
      endTime: null,
      scheduledStartTime: null,
      scheduledEndTime: null,
    },
    create: {
      competitionId,
      activityId,
      startTime: new Date(),
      endTime: null,
    },
  });

  // TODO: Expose room somehow
  await pubsub.publish('ACTIVITY_UPDATED', { activityUpdated: activity });

  return activity;
};

export const stopActivity = async (
  competitionId: string,
  activityId: number
) => {
  const activity = await prisma.activityHistory.update({
    where: {
      competitionId_activityId: {
        competitionId,
        activityId,
      },
    },
    data: {
      endTime: new Date(),
      scheduledStartTime: null,
      scheduledEndTime: null,
    },
  });

  await pubsub.publish('ACTIVITY_UPDATED', { activityUpdated: activity });
  return activity;
};

export const scheduleActivity = async (
  competitionId: string,
  activityId: number,
  props: { scheduledStartTime: Date } | { scheduledEndTime: Date }
) => {
  const activity = await prisma.activityHistory.upsert({
    where: {
      competitionId_activityId: {
        competitionId,
        activityId,
      },
    },
    update: {
      ...('scheduledStartTime' in props && {
        scheduledStartTime: props.scheduledStartTime,
      }),
      ...('scheduledEndTime' in props && {
        scheduledEndTime: props.scheduledEndTime,
      }),
    },
    create: {
      competitionId,
      activityId,
      ...('scheduledStartTime' in props && {
        scheduledStartTime: props.scheduledStartTime,
      }),
      ...('scheduledEndTime' in props && {
        scheduledEndTime: props.scheduledEndTime,
      }),
    },
  });

  await pubsub.publish('ACTIVITY_UPDATED', { activityUpdated: activity });

  return activity;
};
