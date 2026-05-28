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

  if (user.competitionGroups) {
    const allowedCompetitionIds = (
      user.competitionGroups.competitionIds ?? []
    ).map((id) => id.toLowerCase());

    if (!allowedCompetitionIds.includes(competitionId.toLowerCase())) {
      throw new Error('Not Authorized');
    }

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

const parseStartTime = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid start time');
  }

  if (date > new Date()) {
    throw new Error('Use scheduleActivity to queue a future start time');
  }

  return date;
};

const requireAutoAdvanceCompetition = async (
  db: AppContext['db'],
  competitionId: string
) => {
  const competition = await db.competition.findFirst({
    where: {
      id: competitionId,
      autoAdvance: true,
    },
  });

  if (!competition) {
    throw new Error('Auto advance is not enabled for this competition');
  }
};

const ensureRunningActivity = async (
  db: AppContext['db'],
  competitionId: string,
  activityId: number
) => {
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
};

const publishActivityUpdates = async (
  pubsub: AppContext['pubsub'],
  activities: unknown[]
) => {
  await Promise.all(
    activities.map(
      async (activity) =>
        await pubsub.publish('ACTIVITY_UPDATED', {
          activityUpdated: activity,
        })
    )
  );
};

export const startActivity: MutationResolvers<AppContext>['startActivity'] =
  async (_, { competitionId, activityId, startTime }, { db, user, wcaApi }) => {
    await isAuthorized(db, competitionId, user);

    cancelScheduledActivityJob(competitionId, activityId);

    const activity = await activitiesController.startActivity(
      competitionId,
      activityId,
      { startTime: parseStartTime(startTime) }
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
  async (
    _,
    { competitionId, activityIds, startTime },
    { db, user, wcaApi, pubsub }
  ) => {
    await isAuthorized(db, competitionId, user);
    const parsedStartTime = parseStartTime(startTime);
    const effectiveStartTime = parsedStartTime ?? new Date();

    const activities = await db.$transaction(async (tx) =>
      Promise.all(
        activityIds.map(async (activityId) =>
          tx.activityHistory.upsert({
            where: {
              competitionId_activityId: {
                competitionId,
                activityId,
              },
            },
            update: {
              startTime: effectiveStartTime,
              endTime: null,
              scheduledStartTime: null,
              scheduledEndTime: null,
            },
            create: {
              competitionId,
              activityId,
              startTime: effectiveStartTime,
              endTime: null,
            },
          })
        )
      )
    );

    activityIds.forEach((activityId) => {
      cancelScheduledActivityJob(competitionId, activityId);
    });
    await publishActivityUpdates(pubsub, activities);

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

    const endTime = new Date();
    const activities = await db.$transaction(async (tx) =>
      Promise.all(
        activityIds.map(async (activityId) =>
          tx.activityHistory.update({
            where: {
              competitionId_activityId: {
                competitionId,
                activityId,
              },
            },
            data: {
              endTime,
              scheduledStartTime: null,
              scheduledEndTime: null,
            },
          })
        )
      )
    );

    activityIds.forEach((activityId) => {
      cancelScheduledActivityJob(competitionId, activityId);
    });
    await publishActivityUpdates(pubsub, activities);

    await scheduleAutoAdvanceIfEnabled(db, competitionId);

    return activities;
  };

export const resetActivities: MutationResolvers<AppContext>['resetActivities'] =
  async (_, { competitionId, activityIds }, { db, user, pubsub }) => {
    await isAuthorized(db, competitionId, user);

    const { findActivities } = await db.$transaction(async (tx) => {
      await tx.activityHistory.updateMany({
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

      return {
        findActivities: await tx.activityHistory.findMany({
          where: {
            competitionId,
            ...(activityIds && {
              activityId: {
                in: activityIds,
              },
            }),
          },
        }),
      };
    });

    if (activityIds) {
      activityIds.forEach((activityId) => {
        cancelScheduledActivityJob(competitionId, activityId);
      });
    } else {
      cancelCompetitionActivityJobs(competitionId);
    }

    await publishActivityUpdates(pubsub, findActivities);

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
    { db, user, pubsub }
  ) => {
    await isAuthorized(db, competitionId, user);

    if (Boolean(scheduledStartTime) === Boolean(scheduledEndTime)) {
      throw new Error(
        'Provide exactly one of scheduledStartTime or scheduledEndTime'
      );
    }

    await requireAutoAdvanceCompetition(db, competitionId);

    if (scheduledEndTime) {
      await ensureRunningActivity(db, competitionId, activityId);
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

export const scheduleActivities: MutationResolvers<AppContext>['scheduleActivities'] =
  async (
    _,
    { competitionId, activityIds, scheduledStartTime, scheduledEndTime },
    { db, user, pubsub }
  ) => {
    await isAuthorized(db, competitionId, user);

    if (Boolean(scheduledStartTime) === Boolean(scheduledEndTime)) {
      throw new Error(
        'Provide exactly one of scheduledStartTime or scheduledEndTime'
      );
    }

    await requireAutoAdvanceCompetition(db, competitionId);

    if (scheduledEndTime) {
      await Promise.all(
        activityIds.map(async (activityId) =>
          ensureRunningActivity(db, competitionId, activityId)
        )
      );
    }

    const props = scheduledStartTime
      ? { scheduledStartTime: parseScheduledTime(scheduledStartTime) }
      : { scheduledEndTime: parseScheduledTime(scheduledEndTime) };

    const activities = await db.$transaction(async (tx) =>
      Promise.all(
        activityIds.map(async (activityId) =>
          tx.activityHistory.upsert({
            where: {
              competitionId_activityId: {
                competitionId,
                activityId,
              },
            },
            update: {
              ...('scheduledStartTime' in props && {
                scheduledStartTime: props.scheduledStartTime,
                scheduledEndTime: null,
              }),
              ...('scheduledEndTime' in props && {
                scheduledStartTime: null,
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
          })
        )
      )
    );

    activityIds.forEach((activityId) => {
      cancelScheduledActivityJob(competitionId, activityId);
    });
    await publishActivityUpdates(pubsub, activities);

    await Promise.all(
      activities.map(async (activity) => scheduleActivityJob(activity))
    );

    return activities;
  };

export const cancelScheduledActivity: MutationResolvers<AppContext>['cancelScheduledActivity'] =
  async (_, { competitionId, activityId }, { db, user }) => {
    await isAuthorized(db, competitionId, user);

    cancelScheduledActivityJob(competitionId, activityId);

    return activitiesController.cancelScheduledActivity(
      competitionId,
      activityId
    );
  };

export const cancelScheduledActivities: MutationResolvers<AppContext>['cancelScheduledActivities'] =
  async (_, { competitionId, activityIds }, { db, user, pubsub }) => {
    await isAuthorized(db, competitionId, user);

    const activities = await db.$transaction(async (tx) =>
      Promise.all(
        activityIds.map(async (activityId) =>
          tx.activityHistory.update({
            where: {
              competitionId_activityId: {
                competitionId,
                activityId,
              },
            },
            data: {
              scheduledStartTime: null,
              scheduledEndTime: null,
            },
          })
        )
      )
    );

    activityIds.forEach((activityId) => {
      cancelScheduledActivityJob(competitionId, activityId);
    });
    await publishActivityUpdates(pubsub, activities);

    return activities;
  };
