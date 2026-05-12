import { AppContext } from '../../../server';
import { MutationResolvers } from '../../../generated/graphql';
import { sendWebhooksForCompetition } from '../../../controllers/webhooks';
import { createNotificationsForActivity } from '../../../lib/notifications';
import * as activitiesController from '../../../controllers/activities';
import {
  cancelCompetitionActivityJobs,
  cancelScheduledActivityJob,
  determineAndScheduleCompetition,
  scheduleActivity as scheduleActivityJob,
} from '../../../scheduler';

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

  if (
    user.competitionGroups?.competitionIds &&
    !user.competitionGroups.competitionIds.includes(competitionId)
  ) {
    throw new Error('Not Authorized');
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

const scheduleAutoAdvanceIfEnabled = async (
  db: AppContext['db'],
  competitionId: string
) => {
  const competition = await db.competition.findFirst({
    where: {
      id: competitionId,
      autoAdvance: true,
    },
    include: {
      activityHistory: true,
    },
  });

  if (competition) {
    await determineAndScheduleCompetition(competition);
  }
};

const parseScheduledTime = (value: unknown) => {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid scheduled time');
  }

  if (date <= new Date()) {
    throw new Error('Scheduled time must be in the future');
  }

  return date;
};

export const startActivity: MutationResolvers<AppContext>['startActivity'] =
  async (_, { competitionId, activityId }, { db, user, wcaApi }) => {
    await isAuthorized(db, competitionId, user);

    cancelScheduledActivityJob(competitionId, activityId);

    const activity = await activitiesController.startActivity(
      competitionId,
      activityId
    );
    await scheduleAutoAdvanceIfEnabled(db, competitionId);

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
      res
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .forEach((r) => {
          console.log(competitionId, 'WEBHOOK REJECTED', r.reason);
        });
    });

    return activity;
  };

export const startActivities: MutationResolvers<AppContext>['startActivities'] =
  async (_, { competitionId, activityIds }, { db, user, wcaApi }) => {
    await isAuthorized(db, competitionId, user);

    activityIds.forEach((activityId) => {
      cancelScheduledActivityJob(competitionId, activityId);
    });

    const activities = await Promise.all(
      activityIds.map(async (activityId) =>
        activitiesController.startActivity(competitionId, activityId)
      )
    );
    await scheduleAutoAdvanceIfEnabled(db, competitionId);

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
      res
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .forEach((r) => {
          console.log(competitionId, 'WEBHOOK REJECTED', r.reason);
        });
    });

    return activities;
  };

export const stopActivity: MutationResolvers<AppContext>['stopActivity'] =
  async (_, { competitionId, activityId }, { db, user }) => {
    await isAuthorized(db, competitionId, user);

    cancelScheduledActivityJob(competitionId, activityId);

    const activity = await activitiesController.stopActivity(
      competitionId,
      activityId
    );
    await scheduleAutoAdvanceIfEnabled(db, competitionId);

    return activity;
  };

export const stopActivities: MutationResolvers<AppContext>['stopActivities'] =
  async (_, { competitionId, activityIds }, { db, user, pubsub }) => {
    await isAuthorized(db, competitionId, user);

    activityIds.forEach((activityId) => {
      cancelScheduledActivityJob(competitionId, activityId);
    });

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
            scheduledStartTime: null,
            scheduledEndTime: null,
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

    await scheduleAutoAdvanceIfEnabled(db, competitionId);

    return activities;
  };

export const resetActivities: MutationResolvers<AppContext>['resetActivities'] =
  async (_, { competitionId, activityIds }, { db, user, pubsub }) => {
    await isAuthorized(db, competitionId, user);

    if (activityIds) {
      activityIds.forEach((activityId) => {
        cancelScheduledActivityJob(competitionId, activityId);
      });
    } else {
      cancelCompetitionActivityJobs(competitionId);
    }

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
        scheduledStartTime: null,
        scheduledEndTime: null,
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
    await isAuthorized(db, competitionId, user);

    cancelScheduledActivityJob(competitionId, activityId);

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
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });

    // TODO: Expose room somehow
    await pubsub.publish('ACTIVITY_UPDATED', { activityUpdated: activity });

    return activity;
  };

export const scheduleActivity: MutationResolvers<AppContext>['scheduleActivity'] =
  async (
    _,
    { competitionId, activityId, scheduledStartTime, scheduledEndTime },
    { db, user }
  ) => {
    await isAuthorized(db, competitionId, user);

    if (Boolean(scheduledStartTime) === Boolean(scheduledEndTime)) {
      throw new Error(
        'Provide exactly one of scheduledStartTime or scheduledEndTime'
      );
    }

    const competition = await db.competition.findFirst({
      where: {
        id: competitionId,
        autoAdvance: true,
      },
    });

    if (!competition) {
      throw new Error('Auto advance is not enabled for this competition');
    }

    if (scheduledEndTime) {
      const runningActivity = await db.activityHistory.findUnique({
        where: {
          competitionId_activityId: {
            competitionId,
            activityId,
          },
        },
      });

      if (!runningActivity?.startTime || runningActivity.endTime) {
        throw new Error('Only a running activity can have its end time queued');
      }
    }

    const activity = await activitiesController.scheduleActivity(
      competitionId,
      activityId,
      scheduledStartTime
        ? { scheduledStartTime: parseScheduledTime(scheduledStartTime) }
        : { scheduledEndTime: parseScheduledTime(scheduledEndTime) }
    );

    await scheduleActivityJob(activity);

    return activity;
  };
