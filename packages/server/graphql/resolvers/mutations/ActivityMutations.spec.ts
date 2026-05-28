/* eslint-disable import/first */
import { userFixture } from '../../../test/helpers';

const mockCancelScheduledActivityJob = jest.fn();
const mockCancelCompetitionActivityJobs = jest.fn();
const mockScheduleActivityJob = jest.fn();
const mockDetermineAndScheduleCompetition = jest.fn();
const mockStartActivityController = jest.fn();
const mockStopActivityController = jest.fn();
const mockScheduleActivityController = jest.fn();
const mockCancelScheduledActivityController = jest.fn();
const mockSendWebhooksForCompetition = jest.fn();

jest.mock('../../../scheduler', () => ({
  cancelCompetitionActivityJobs: mockCancelCompetitionActivityJobs,
  cancelScheduledActivityJob: mockCancelScheduledActivityJob,
  determineAndScheduleCompetition: mockDetermineAndScheduleCompetition,
  scheduleActivity: mockScheduleActivityJob,
}));

jest.mock('../../../controllers/activities', () => ({
  startActivity: mockStartActivityController,
  stopActivity: mockStopActivityController,
  scheduleActivity: mockScheduleActivityController,
  cancelScheduledActivity: mockCancelScheduledActivityController,
}));

jest.mock('../../../controllers/webhooks', () => ({
  sendWebhooksForCompetition: mockSendWebhooksForCompetition,
}));

import {
  cancelScheduledActivity,
  cancelScheduledActivities,
  resetActivities,
  resetActivity,
  scheduleActivities,
  scheduleActivity,
  startActivities,
  startActivity,
  stopActivities,
  stopActivity,
} from './ActivityMutations';

const callStartActivity = startActivity as (
  parent: unknown,
  args: { competitionId: string; activityId: number; startTime?: unknown },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callStartActivities = startActivities as (
  parent: unknown,
  args: { competitionId: string; activityIds: number[]; startTime?: unknown },
  context: unknown,
  info: unknown
) => Promise<unknown[]>;

const callStopActivity = stopActivity as (
  parent: unknown,
  args: { competitionId: string; activityId: number },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callStopActivities = stopActivities as (
  parent: unknown,
  args: { competitionId: string; activityIds: number[] },
  context: unknown,
  info: unknown
) => Promise<unknown[]>;

const callResetActivity = resetActivity as (
  parent: unknown,
  args: { competitionId: string; activityId: number },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callResetActivities = resetActivities as (
  parent: unknown,
  args: { competitionId: string; activityIds?: number[] | null },
  context: unknown,
  info: unknown
) => Promise<unknown[]>;

const callScheduleActivity = scheduleActivity as (
  parent: unknown,
  args: {
    competitionId: string;
    activityId: number;
    scheduledStartTime?: unknown;
    scheduledEndTime?: unknown;
  },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callScheduleActivities = scheduleActivities as (
  parent: unknown,
  args: {
    competitionId: string;
    activityIds: number[];
    scheduledStartTime?: unknown;
    scheduledEndTime?: unknown;
  },
  context: unknown,
  info: unknown
) => Promise<unknown[]>;

const callCancelScheduledActivities = cancelScheduledActivities as (
  parent: unknown,
  args: { competitionId: string; activityIds: number[] },
  context: unknown,
  info: unknown
) => Promise<unknown[]>;

const callCancelScheduledActivity = cancelScheduledActivity as (
  parent: unknown,
  args: { competitionId: string; activityId: number },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const createDb = () => {
  const db = {
    competitionAccess: {
      findFirst: jest.fn().mockResolvedValue({ userId: 123 }),
    },
    competition: {
      findFirst: jest.fn().mockResolvedValue({ id: 'TestComp2026' }),
    },
    activityHistory: {
      upsert: jest.fn().mockImplementation(async ({ where, update, create }) => ({
        competitionId:
          where.competitionId_activityId?.competitionId ?? create.competitionId,
        activityId: where.competitionId_activityId?.activityId ?? create.activityId,
        ...create,
        ...update,
      })),
      update: jest.fn().mockImplementation(async ({ where, data = {} }) => ({
        competitionId: where.competitionId_activityId.competitionId,
        activityId: where.competitionId_activityId.activityId,
        ...data,
      })),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      findMany: jest.fn().mockResolvedValue([
        { competitionId: 'TestComp2026', activityId: 1 },
        { competitionId: 'TestComp2026', activityId: 2 },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        competitionId: 'TestComp2026',
        activityId: 1,
        startTime: new Date('2026-01-01T10:00:00Z'),
        endTime: null,
      }),
    },
  };

  return {
    ...db,
    $transaction: jest.fn(async (callback: (tx: typeof db) => unknown) =>
      callback(db)
    ),
  };
};

describe('ActivityMutations scheduling', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00Z'));
    mockCancelCompetitionActivityJobs.mockReset();
    mockCancelScheduledActivityJob.mockReset();
    mockScheduleActivityJob.mockReset().mockResolvedValue(undefined);
    mockDetermineAndScheduleCompetition.mockReset().mockResolvedValue(undefined);
    mockStartActivityController.mockReset().mockImplementation(
      async (competitionId: string, activityId: number, props: object) => ({
        competitionId,
        activityId,
        ...props,
      })
    );
    mockStopActivityController.mockReset().mockImplementation(
      async (competitionId: string, activityId: number) => ({
        competitionId,
        activityId,
      })
    );
    mockScheduleActivityController.mockReset().mockImplementation(
      async (competitionId: string, activityId: number, props: object) => ({
        competitionId,
        activityId,
        ...props,
      })
    );
    mockCancelScheduledActivityController.mockReset().mockImplementation(
      async (competitionId: string, activityId: number) => ({
        competitionId,
        activityId,
      })
    );
    mockSendWebhooksForCompetition.mockReset().mockResolvedValue([]);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('rejects unauthenticated scheduling', async () => {
    await expect(
      callScheduleActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          scheduledStartTime: '2026-01-01T10:05:00Z',
          scheduledEndTime: null,
        },
        { db: createDb(), user: undefined },
        {}
      )
    ).rejects.toThrow('Not Authenticated');
  });

  it('rejects Competition Groups users scoped away from the competition', async () => {
    await expect(
      callStartActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          startTime: '2026-01-01T09:55:00Z',
        },
        {
          db: createDb(),
          user: userFixture({
            competitionGroups: {
              competitionIds: ['OtherComp2026'],
              scopes: ['notifycomp.remote'],
            },
          }),
          wcaApi: { getWcif: jest.fn() },
        },
        {}
      )
    ).rejects.toThrow('Not Authorized');

    expect(mockStartActivityController).not.toHaveBeenCalled();
  });

  it('allows Competition Groups users scoped to the competition without delegate access rows', async () => {
    const db = createDb();
    db.competitionAccess.findFirst.mockResolvedValue(null);

    await expect(
      callStartActivity(
        {},
        {
          competitionId: 'testcomp2026',
          activityId: 1,
          startTime: '2026-01-01T09:55:00Z',
        },
        {
          db,
          user: userFixture({
            competitionGroups: {
              competitionIds: ['TestComp2026'],
              scopes: ['notifycomp.remote'],
            },
          }),
          wcaApi: {
            getWcif: jest.fn().mockResolvedValue({
              id: 'TestComp2026',
              persons: [],
            }),
          },
        },
        {}
      )
    ).resolves.toEqual({
      competitionId: 'testcomp2026',
      activityId: 1,
      startTime: new Date('2026-01-01T09:55:00Z'),
    });

    expect(db.competitionAccess.findFirst).not.toHaveBeenCalled();
  });

  it('rejects users without delegate access', async () => {
    const db = createDb();
    db.competitionAccess.findFirst.mockResolvedValue(null);

    await expect(
      callStopActivity(
        {},
        { competitionId: 'TestComp2026', activityId: 1 },
        { db, user: userFixture() },
        {}
      )
    ).rejects.toThrow('Not Authorized');

    expect(mockStopActivityController).not.toHaveBeenCalled();
  });

  it('allows the super admin user without delegate access', async () => {
    const db = createDb();
    db.competitionAccess.findFirst.mockResolvedValue(null);

    await expect(
      callStopActivity(
        {},
        { competitionId: 'TestComp2026', activityId: 1 },
        { db, user: userFixture({ id: 8184 }) },
        {}
      )
    ).resolves.toEqual({ competitionId: 'TestComp2026', activityId: 1 });

    expect(db.competitionAccess.findFirst).not.toHaveBeenCalled();
    expect(mockStopActivityController).toHaveBeenCalledWith('TestComp2026', 1);
  });

  it('requires exactly one scheduled time', async () => {
    await expect(
      callScheduleActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          scheduledStartTime: '2026-01-01T10:05:00Z',
          scheduledEndTime: '2026-01-01T10:10:00Z',
        },
        { db: createDb(), user: userFixture() },
        {}
      )
    ).rejects.toThrow('Provide exactly one of scheduledStartTime or scheduledEndTime');
  });

  it('rejects past scheduled times', async () => {
    await expect(
      callScheduleActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          scheduledStartTime: '2026-01-01T09:59:00Z',
          scheduledEndTime: null,
        },
        { db: createDb(), user: userFixture() },
        {}
      )
    ).rejects.toThrow('Scheduled time must be in the future');
  });

  it('schedules a future activity start for auto-advance competitions', async () => {
    const db = createDb();

    await expect(
      callScheduleActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          scheduledStartTime: '2026-01-01T10:05:00Z',
          scheduledEndTime: null,
        },
        { db, user: userFixture() },
        {}
      )
    ).resolves.toMatchObject({
      competitionId: 'TestComp2026',
      activityId: 1,
      scheduledStartTime: new Date('2026-01-01T10:05:00Z'),
    });

    expect(mockScheduleActivityController).toHaveBeenCalledWith(
      'TestComp2026',
      1,
      { scheduledStartTime: new Date('2026-01-01T10:05:00Z') }
    );
    expect(mockScheduleActivityJob).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: 1 })
    );
  });

  it('requires a running activity before scheduling an end time', async () => {
    const db = createDb();
    db.activityHistory.findUnique.mockResolvedValue({
      startTime: null,
      endTime: null,
    });

    await expect(
      callScheduleActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          scheduledStartTime: null,
          scheduledEndTime: '2026-01-01T10:05:00Z',
        },
        { db, user: userFixture() },
        {}
      )
    ).rejects.toThrow('Only a running activity can have its end time queued');
  });

  it('schedules multiple activities transactionally and cancels stale jobs after persistence', async () => {
    const db = createDb();
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callScheduleActivities(
        {},
        {
          competitionId: 'TestComp2026',
          activityIds: [1, 2],
          scheduledStartTime: '2026-01-01T10:05:00Z',
          scheduledEndTime: null,
        },
        { db, user: userFixture(), pubsub },
        {}
      )
    ).resolves.toHaveLength(2);

    expect(db.$transaction).toHaveBeenCalled();
    expect(db.activityHistory.upsert).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      1
    );
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      2
    );
    expect(pubsub.publish).toHaveBeenCalledTimes(2);
    expect(mockScheduleActivityController).not.toHaveBeenCalled();
    expect(mockScheduleActivityJob).toHaveBeenCalledTimes(2);
  });

  it('starts an activity, cancels queued jobs, schedules auto advance, and sends webhooks', async () => {
    const db = createDb();
    const wcaApi = {
      getWcif: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        persons: [],
      }),
    };
    await expect(
      callStartActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          startTime: '2026-01-01T09:55:00Z',
        },
        { db, user: userFixture(), wcaApi },
        {}
      )
    ).resolves.toEqual({
      competitionId: 'TestComp2026',
      activityId: 1,
      startTime: new Date('2026-01-01T09:55:00Z'),
    });

    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      1
    );
    expect(mockStartActivityController).toHaveBeenCalledWith(
      'TestComp2026',
      1,
      { startTime: new Date('2026-01-01T09:55:00Z') }
    );
    expect(mockDetermineAndScheduleCompetition).toHaveBeenCalledWith({
      id: 'TestComp2026',
    });
    expect(wcaApi.getWcif).toHaveBeenCalledWith('TestComp2026');
    expect(mockSendWebhooksForCompetition).toHaveBeenCalledWith(
      'TestComp2026',
      {
        competitionId: 'TestComp2026',
        notifications: [{ type: 'activity', id: 1 }],
      }
    );
  });

  it('starts multiple activities and sends one webhook payload', async () => {
    const db = createDb();
    const wcaApi = {
      getWcif: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        persons: [],
      }),
    };
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callStartActivities(
        {},
        {
          competitionId: 'TestComp2026',
          activityIds: [1, 2],
          startTime: '2026-01-01T09:55:00Z',
        },
        { db, user: userFixture(), wcaApi, pubsub },
        {}
      )
    ).resolves.toMatchObject([
      {
        competitionId: 'TestComp2026',
        activityId: 1,
        startTime: new Date('2026-01-01T09:55:00Z'),
      },
      {
        competitionId: 'TestComp2026',
        activityId: 2,
        startTime: new Date('2026-01-01T09:55:00Z'),
      },
    ]);

    expect(db.$transaction).toHaveBeenCalled();
    expect(db.activityHistory.upsert).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledTimes(2);
    expect(pubsub.publish).toHaveBeenCalledTimes(2);
    expect(mockStartActivityController).not.toHaveBeenCalled();
    expect(mockDetermineAndScheduleCompetition).toHaveBeenCalledWith({
      id: 'TestComp2026',
    });
    expect(wcaApi.getWcif).toHaveBeenCalledWith('TestComp2026');
    expect(mockSendWebhooksForCompetition).toHaveBeenCalledWith(
      'TestComp2026',
      {
        competitionId: 'TestComp2026',
        notifications: [
          { type: 'activity', id: 1 },
          { type: 'activity', id: 2 },
        ],
      }
    );
  });

  it('rejects future start times and invalid start times', async () => {
    await expect(
      callStartActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          startTime: '2026-01-01T10:05:00Z',
        },
        { db: createDb(), user: userFixture(), wcaApi: { getWcif: jest.fn() } },
        {}
      )
    ).rejects.toThrow('Use scheduleActivity to queue a future start time');

    await expect(
      callStartActivity(
        {},
        {
          competitionId: 'TestComp2026',
          activityId: 1,
          startTime: 'not-a-date',
        },
        { db: createDb(), user: userFixture(), wcaApi: { getWcif: jest.fn() } },
        {}
      )
    ).rejects.toThrow('Invalid start time');
  });

  it('stops one activity and then schedules auto advance', async () => {
    const db = createDb();

    await expect(
      callStopActivity(
        {},
        { competitionId: 'TestComp2026', activityId: 1 },
        { db, user: userFixture() },
        {}
      )
    ).resolves.toEqual({ competitionId: 'TestComp2026', activityId: 1 });

    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      1
    );
    expect(mockStopActivityController).toHaveBeenCalledWith('TestComp2026', 1);
    expect(mockDetermineAndScheduleCompetition).toHaveBeenCalledWith({
      id: 'TestComp2026',
    });
  });

  it('stops multiple activities and publishes updates', async () => {
    const db = createDb();
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callStopActivities(
        {},
        { competitionId: 'TestComp2026', activityIds: [1, 2] },
        { db, user: userFixture(), pubsub },
        {}
      )
    ).resolves.toMatchObject([
      { competitionId: 'TestComp2026', activityId: 1 },
      { competitionId: 'TestComp2026', activityId: 2 },
    ]);

    expect(db.activityHistory.update).toHaveBeenCalledTimes(2);
    expect(pubsub.publish).toHaveBeenCalledTimes(2);
    expect(mockDetermineAndScheduleCompetition).toHaveBeenCalledWith({
      id: 'TestComp2026',
    });
  });

  it('resets selected activities and publishes the updated rows', async () => {
    const db = createDb();
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callResetActivities(
        {},
        { competitionId: 'TestComp2026', activityIds: [1, 2] },
        { db, user: userFixture(), pubsub },
        {}
      )
    ).resolves.toEqual([
      { competitionId: 'TestComp2026', activityId: 1 },
      { competitionId: 'TestComp2026', activityId: 2 },
    ]);

    expect(mockCancelScheduledActivityJob).toHaveBeenCalledTimes(2);
    expect(db.activityHistory.updateMany).toHaveBeenCalledWith({
      where: {
        competitionId: 'TestComp2026',
        activityId: {
          in: [1, 2],
        },
      },
      data: {
        startTime: null,
        endTime: null,
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });
    expect(pubsub.publish).toHaveBeenCalledTimes(2);
  });

  it('resets all competition activities when no activity ids are provided', async () => {
    const db = createDb();
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callResetActivities(
        {},
        { competitionId: 'TestComp2026', activityIds: null },
        { db, user: userFixture(), pubsub },
        {}
      )
    ).resolves.toEqual([
      { competitionId: 'TestComp2026', activityId: 1 },
      { competitionId: 'TestComp2026', activityId: 2 },
    ]);

    expect(mockCancelCompetitionActivityJobs).toHaveBeenCalledWith(
      'TestComp2026'
    );
    expect(mockCancelScheduledActivityJob).not.toHaveBeenCalled();
    expect(db.activityHistory.updateMany).toHaveBeenCalledWith({
      where: {
        competitionId: 'TestComp2026',
      },
      data: {
        startTime: null,
        endTime: null,
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });
    expect(db.activityHistory.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: 'TestComp2026',
      },
    });
    expect(pubsub.publish).toHaveBeenCalledTimes(2);
  });

  it('resets a single activity and publishes the update', async () => {
    const db = createDb();
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callResetActivity(
        {},
        { competitionId: 'TestComp2026', activityId: 1 },
        { db, user: userFixture(), pubsub },
        {}
      )
    ).resolves.toMatchObject({ competitionId: 'TestComp2026', activityId: 1 });

    expect(db.activityHistory.update).toHaveBeenCalledWith({
      where: {
        competitionId_activityId: {
          competitionId: 'TestComp2026',
          activityId: 1,
        },
      },
      data: {
        startTime: null,
        endTime: null,
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });
    expect(pubsub.publish).toHaveBeenCalledWith('ACTIVITY_UPDATED', {
      activityUpdated: expect.objectContaining({
        competitionId: 'TestComp2026',
        activityId: 1,
      }),
    });
  });

  it('cancels queued activity times for multiple activities transactionally', async () => {
    const db = createDb();
    const pubsub = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      callCancelScheduledActivities(
        {},
        { competitionId: 'TestComp2026', activityIds: [1, 2] },
        { db, user: userFixture(), pubsub },
        {}
      )
    ).resolves.toMatchObject([
      { competitionId: 'TestComp2026', activityId: 1 },
      { competitionId: 'TestComp2026', activityId: 2 },
    ]);

    expect(db.$transaction).toHaveBeenCalled();
    expect(db.activityHistory.update).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledTimes(2);
    expect(pubsub.publish).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledActivityController).not.toHaveBeenCalled();
  });

  it('cancels one queued activity time', async () => {
    await expect(
      callCancelScheduledActivity(
        {},
        { competitionId: 'TestComp2026', activityId: 1 },
        { db: createDb(), user: userFixture() },
        {}
      )
    ).resolves.toEqual({ competitionId: 'TestComp2026', activityId: 1 });

    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      1
    );
    expect(mockCancelScheduledActivityController).toHaveBeenCalledWith(
      'TestComp2026',
      1
    );
  });
});
