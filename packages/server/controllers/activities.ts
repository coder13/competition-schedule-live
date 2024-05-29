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
    },
  });

  await pubsub.publish('ACTIVITY_UPDATED', { activityUpdated: activity });
  return activity;
};
