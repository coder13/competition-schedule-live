import { AppContext } from '../../../server';
import { MutationResolvers } from '../../../generated/graphql';

export const startActivity: MutationResolvers<AppContext>['startActivity'] =
  async (_, { competitionId, activityId }, { db, user, pubsub }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const activity = await db.activityHistory.create({
      data: {
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

export const stopActivity: MutationResolvers<AppContext>['stopActivity'] =
  async (_, { competitionId, activityId }, { db, user, pubsub }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const activity = await db.activityHistory.update({
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
