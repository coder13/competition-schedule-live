import { AppContext } from '../../../server';
import { MutationResolvers } from '../../../generated/graphql';
import { sendWebhooksForCompetition } from '../../../controllers/webhooks';
import { createNotificationsForActivity } from '../../../lib/notifications';

export const startActivity: MutationResolvers<AppContext>['startActivity'] =
  async (_, { competitionId, activityId }, { db, user, pubsub, wcaApi }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const compAccess = await db.competitionAccess.findFirst({
      where: {
        competitionId: {
          equals: competitionId,
          mode: 'insensitive',
        },
        userId: user.id,
      },
    });

    if (!compAccess) {
      throw new Error('Not Authorized');
    }

    const activity = await db.activityHistory.upsert({
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

    const wcif = await wcaApi.getWcif(competitionId);

    void sendWebhooksForCompetition(
      competitionId,
      await createNotificationsForActivity(wcif, [activityId])
    ).then((res) => {
      console.log(
        {
          competitionId,
          activityId,
        },
        competitionId,
        'Sucessfully pinged',
        res.filter((r) => r.status === 'fulfilled').length,
        'webhooks'
      );
      (
        res.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]
      ).forEach((r) => {
        console.log(competitionId, 'WEBHOOK REJECTED', r.reason);
      });
    });

    return activity;
  };

export const stopActivity: MutationResolvers<AppContext>['stopActivity'] =
  async (_, { competitionId, activityId }, { db, user, pubsub }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const compAccess = await db.competitionAccess.findFirst({
      where: {
        competitionId: {
          equals: competitionId,
          mode: 'insensitive',
        },
        userId: user.id,
      },
    });

    if (!compAccess) {
      throw new Error('Not Authorized');
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

export const resetActivities: MutationResolvers<AppContext>['resetActivities'] =
  async (_, { competitionId }, { db, user, pubsub }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    // Work for me but not for thee
    if (user.id !== 8184) {
      const compAccess = await db.competitionAccess.findFirst({
        where: {
          competitionId,
          userId: user.id,
        },
      });

      if (!compAccess) {
        throw new Error('Not Authorized');
      }
    }

    await db.activityHistory.updateMany({
      where: {
        competitionId,
      },
      data: {
        startTime: null,
        endTime: null,
      },
    });

    const findActivities = await db.activityHistory.findMany({
      where: {
        competitionId,
      },
    });

    console.log(findActivities);

    await Promise.all(
      findActivities.map(
        async (activity) =>
          await pubsub.publish('ACTIVITY_UPDATED', {
            activityUpdated: activity,
          })
      )
    );

    return findActivities;
  };

export const resetActivity: MutationResolvers<AppContext>['resetActivity'] =
  async (_, { competitionId, activityId }, { db, user, pubsub }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const compAccess = await db.competitionAccess.findFirst({
      where: {
        competitionId: {
          equals: competitionId,
          mode: 'insensitive',
        },
        userId: user.id,
      },
    });

    if (!compAccess) {
      throw new Error('Not Authorized');
    }

    const activity = await db.activityHistory.update({
      where: {
        competitionId_activityId: {
          competitionId,
          activityId,
        },
      },
      data: {
        startTime: null,
        endTime: null,
      },
    });

    // TODO: Expose room somehow
    await pubsub.publish('ACTIVITY_UPDATED', { activityUpdated: activity });

    return activity;
  };
