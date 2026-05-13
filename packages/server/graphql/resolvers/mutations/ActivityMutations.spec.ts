/* eslint-disable import/first */
import { userFixture } from '../../../test/helpers';

const mockCancelScheduledActivityJob = jest.fn();
const mockScheduleActivityJob = jest.fn();
const mockDetermineAndScheduleCompetition = jest.fn();
const mockScheduleActivityController = jest.fn();

jest.mock('../../../scheduler', () => ({
  cancelCompetitionActivityJobs: jest.fn(),
  cancelScheduledActivityJob: mockCancelScheduledActivityJob,
  determineAndScheduleCompetition: mockDetermineAndScheduleCompetition,
  scheduleActivity: mockScheduleActivityJob,
}));

jest.mock('../../../controllers/activities', () => ({
  scheduleActivity: mockScheduleActivityController,
}));

jest.mock('../../../controllers/webhooks', () => ({
  sendWebhooksForCompetition: jest.fn(),
}));

import { scheduleActivities, scheduleActivity } from './ActivityMutations';

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

const createDb = () => ({
  competitionAccess: {
    findFirst: jest.fn().mockResolvedValue({ userId: 123 }),
  },
  competition: {
    findFirst: jest.fn().mockResolvedValue({ id: 'TestComp2026' }),
  },
  activityHistory: {
    findUnique: jest.fn().mockResolvedValue({
      competitionId: 'TestComp2026',
      activityId: 1,
      startTime: new Date('2026-01-01T10:00:00Z'),
      endTime: null,
    }),
  },
});

describe('ActivityMutations scheduling', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00Z'));
    mockCancelScheduledActivityJob.mockReset();
    mockScheduleActivityJob.mockReset().mockResolvedValue(undefined);
    mockDetermineAndScheduleCompetition.mockReset().mockResolvedValue(undefined);
    mockScheduleActivityController.mockReset().mockImplementation(
      async (competitionId: string, activityId: number, props: object) => ({
        competitionId,
        activityId,
        ...props,
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it('schedules multiple activities and cancels stale jobs first', async () => {
    await expect(
      callScheduleActivities(
        {},
        {
          competitionId: 'TestComp2026',
          activityIds: [1, 2],
          scheduledStartTime: '2026-01-01T10:05:00Z',
          scheduledEndTime: null,
        },
        { db: createDb(), user: userFixture() },
        {}
      )
    ).resolves.toHaveLength(2);

    expect(mockCancelScheduledActivityJob).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      1
    );
    expect(mockCancelScheduledActivityJob).toHaveBeenCalledWith(
      'TestComp2026',
      2
    );
    expect(mockScheduleActivityController).toHaveBeenCalledTimes(2);
    expect(mockScheduleActivityJob).toHaveBeenCalledTimes(2);
  });
});
