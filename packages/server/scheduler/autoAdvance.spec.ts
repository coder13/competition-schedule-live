import type { Activity } from '@wca/helpers';
import { activityFixture, iso } from '../test/helpers';
import { determineAutoAdvancePlan } from './autoAdvance';

const activity = (
  id: number,
  name: string,
  startTime: string,
  endTime: string
): Activity => activityFixture(id, name, startTime, endTime);

const activities = [
  activity(
    1,
    '333-r1-a',
    '2026-01-01T10:00:00Z',
    '2026-01-01T10:30:00Z'
  ),
  activity(
    2,
    '333-r1-b',
    '2026-01-01T10:00:00Z',
    '2026-01-01T10:30:00Z'
  ),
  activity(3, '222-r1', '2026-01-01T10:30:00Z', '2026-01-01T11:00:00Z'),
  activity(4, '444-r1', '2026-01-01T11:30:00Z', '2026-01-01T12:00:00Z'),
];

describe('determineAutoAdvancePlan', () => {
  it('starts the first scheduled group when nothing is running', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T09:55:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T10:00:00Z'));
    expect(plan?.startActivities.map((item) => item.id)).toEqual([1, 2]);
    expect(plan?.stopActivities).toEqual([]);
  });

  it('starts overdue activities immediately instead of getting stuck', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T10:05:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T10:05:00Z'));
    expect(plan?.startActivities.map((item) => item.id)).toEqual([1, 2]);
  });

  it('stops running activities and starts the next group at transition time', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [
        {
          activityId: 1,
          startTime: new Date('2026-01-01T10:00:00Z'),
          endTime: null,
        },
        {
          activityId: 2,
          startTime: new Date('2026-01-01T10:00:00Z'),
          endTime: null,
        },
      ],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T10:10:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T10:30:00Z'));
    expect(plan?.stopActivities.map((item) => item.id)).toEqual([1, 2]);
    expect(plan?.startActivities.map((item) => item.id)).toEqual([3]);
  });

  it('preserves a schedule gap by stopping first and starting later on the next pass', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [
        {
          activityId: 3,
          startTime: new Date('2026-01-01T10:30:00Z'),
          endTime: null,
        },
      ],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T10:45:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T11:00:00Z'));
    expect(plan?.stopActivities.map((item) => item.id)).toEqual([3]);
    expect(plan?.startActivities).toEqual([]);
  });

  it('applies the configured auto advance delay', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [],
      autoAdvanceDelaySeconds: 15,
      now: new Date('2026-01-01T09:55:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T10:00:15Z'));
  });

  it('uses a queued start time when an activity is intentionally scheduled', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [
        {
          activityId: 3,
          startTime: null,
          endTime: null,
          scheduledStartTime: new Date('2026-01-01T10:20:00Z'),
        },
      ],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T10:10:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T10:20:00Z'));
    expect(plan?.startActivities.map((item) => item.id)).toEqual([3]);
  });

  it('uses a queued end time to extend or shorten the running activity', () => {
    const plan = determineAutoAdvancePlan({
      activities,
      activityHistory: [
        {
          activityId: 1,
          startTime: new Date('2026-01-01T10:00:00Z'),
          endTime: null,
          scheduledEndTime: new Date('2026-01-01T10:45:00Z'),
        },
      ],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T10:25:00Z'),
    });

    expect(plan?.jobTime.toISOString()).toBe(iso('2026-01-01T10:45:00Z'));
    expect(plan?.stopActivities.map((item) => item.id)).toEqual([1]);
    expect(plan?.startActivities.map((item) => item.id)).toEqual([3]);
  });

  it('returns null once every activity is completed', () => {
    const plan = determineAutoAdvancePlan({
      activities: [activities[0]],
      activityHistory: [
        {
          activityId: 1,
          startTime: new Date('2026-01-01T10:00:00Z'),
          endTime: new Date('2026-01-01T10:30:00Z'),
        },
      ],
      autoAdvanceDelaySeconds: 0,
      now: new Date('2026-01-01T10:45:00Z'),
    });

    expect(plan).toBeNull();
  });
});
