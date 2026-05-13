/* eslint-disable import/first */
const activityHistory = {
  upsert: jest.fn(),
  update: jest.fn(),
};
const publish = jest.fn();

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    activityHistory,
  },
}));

import {
  cancelScheduledActivity,
  scheduleActivity,
  startActivity,
  stopActivity,
} from './activities';

jest.mock('../graphql/pubsub', () => ({
  pubsub: {
    publish,
  },
}));

describe('activity controllers', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00Z'));
    activityHistory.upsert.mockReset();
    activityHistory.update.mockReset();
    publish.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts an activity and clears queued times', async () => {
    const activity = { competitionId: 'TestComp2026', activityId: 1 };
    activityHistory.upsert.mockResolvedValue(activity);

    await expect(startActivity('TestComp2026', 1)).resolves.toBe(activity);

    expect(activityHistory.upsert).toHaveBeenCalledWith({
      where: {
        competitionId_activityId: {
          competitionId: 'TestComp2026',
          activityId: 1,
        },
      },
      update: {
        startTime: new Date('2026-01-01T10:00:00Z'),
        endTime: null,
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
      create: {
        competitionId: 'TestComp2026',
        activityId: 1,
        startTime: new Date('2026-01-01T10:00:00Z'),
        endTime: null,
      },
    });
    expect(publish).toHaveBeenCalledWith('ACTIVITY_UPDATED', {
      activityUpdated: activity,
    });
  });

  it('stops an activity and clears queued times', async () => {
    const activity = { competitionId: 'TestComp2026', activityId: 1 };
    activityHistory.update.mockResolvedValue(activity);

    await expect(stopActivity('TestComp2026', 1)).resolves.toBe(activity);

    expect(activityHistory.update).toHaveBeenCalledWith({
      where: {
        competitionId_activityId: {
          competitionId: 'TestComp2026',
          activityId: 1,
        },
      },
      data: {
        endTime: new Date('2026-01-01T10:00:00Z'),
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });
    expect(publish).toHaveBeenCalledWith('ACTIVITY_UPDATED', {
      activityUpdated: activity,
    });
  });

  it('schedules exactly one queued start or end time', async () => {
    const scheduledStartTime = new Date('2026-01-01T10:10:00Z');
    const activity = { competitionId: 'TestComp2026', activityId: 1 };
    activityHistory.upsert.mockResolvedValue(activity);

    await expect(
      scheduleActivity('TestComp2026', 1, { scheduledStartTime })
    ).resolves.toBe(activity);

    expect(activityHistory.upsert).toHaveBeenCalledWith({
      where: {
        competitionId_activityId: {
          competitionId: 'TestComp2026',
          activityId: 1,
        },
      },
      update: {
        scheduledStartTime,
        scheduledEndTime: null,
      },
      create: {
        competitionId: 'TestComp2026',
        activityId: 1,
        scheduledStartTime,
      },
    });
  });

  it('cancels queued activity times', async () => {
    const activity = { competitionId: 'TestComp2026', activityId: 1 };
    activityHistory.update.mockResolvedValue(activity);

    await expect(cancelScheduledActivity('TestComp2026', 1)).resolves.toBe(
      activity
    );

    expect(activityHistory.update).toHaveBeenCalledWith({
      where: {
        competitionId_activityId: {
          competitionId: 'TestComp2026',
          activityId: 1,
        },
      },
      data: {
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });
  });
});
