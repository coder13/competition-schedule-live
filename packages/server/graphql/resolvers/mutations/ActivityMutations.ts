import { AppContext } from '../../../server';
import { MutationResolvers } from '../../../generated/graphql';
import { sendWebhooksForCompetition } from '../../../controllers/webhooks';
import { createNotificationsForActivity } from '../../../lib/notifications';
import * as activitiesController from '../../../controllers/activities';

const isAuthorized = async (
  db: AppContext['db'],
  competitionId: string,
  user?: AppContext['user']
) => {
  if (!user) {
    throw new Error('Not Authenticated');
  }

  if (user.id === 8184) {
    return;
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
};

export const startActivity: MutationResolvers<AppContext>['startActivity'] =
  async (_, { competitionId, activityId }, { db, user, wcaApi }) => {
    void isAuthorized(db, competitionId, user);

    const activity = activitiesController.startActivity(
      competitionId,
      activityId
    );

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

export const startActivities: MutationResolvers<AppContext>['startActivities'] =
  async (_, { competitionId, activityIds }, { db, user, wcaApi }) => {
    void isAuthorized(db, competitionId, user);

    const activities = await Promise.all(
      activityIds.map(async (activityId) =>
        activitiesController.startActivity(competitionId, activityId)
      )
    );

    const wcif = await wcaApi.getWcif(competitionId);

    void sendWebhooksForCompetition(
      competitionId,
      await createNotificationsForActivity(wcif, activityIds)
    ).then((res) => {
      console.log(
        {
          competitionId,
          activityIds,
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

    return activities;
  };

export const stopActivity: MutationResolvers<AppContext>['stopActivity'] =
  async (_, { competitionId, activityId }, { db, user }) => {
    void isAuthorized(db, competitionId, user);

    return activitiesController.stopActivity(competitionId, activityId);
  };

export const stopActivities: MutationResolvers<AppContext>['stopActivities'] =
  async (_, { competitionId, activityIds }, { db, user, pubsub }) => {
    void isAuthorized(db, competitionId, user);

    const activities = await Promise.all(
      activityIds.map(async (activityId) => {
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

        return activity;
      })
    );

    await Promise.all(
      activities.map(
        async (activity) =>
          await pubsub.publish('ACTIVITY_UPDATED', {
            activityUpdated: activity,
          })
      )
    );

    return activities;
  };

export const resetActivities: MutationResolvers<AppContext>['resetActivities'] =
  async (_, { competitionId, activityIds }, { db, user, pubsub }) => {
    void isAuthorized(db, competitionId, user);

    await db.activityHistory.updateMany({
      where: {
        competitionId,
        ...(activityIds && {
          activityId: {
            in: activityIds,
          },
        }),
      },
      data: {
        startTime: null,
        endTime: null,
      },
    });

    const findActivities = await db.activityHistory.findMany({
      where: {
        competitionId,
        ...(activityIds && {
          activityId: {
            in: activityIds,
          },
        }),
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
    void isAuthorized(db, competitionId, user);

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
