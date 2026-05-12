import assert from 'assert';
import type { Activity } from '@wca/helpers';
import { determineAutoAdvancePlan } from './autoAdvance';

const activity = (
  id: number,
  name: string,
  startTime: string,
  endTime: string
): Activity => ({
  id,
  name,
  startTime,
  endTime,
  activityCode: name,
  childActivities: [],
  extensions: [],
});

const iso = (date: string) => new Date(date).toISOString();

const activities = [
  activity(
    1,
    '333-r1-a',
    iso('2026-01-01T10:00:00Z'),
    iso('2026-01-01T10:30:00Z')
  ),
  activity(
    2,
    '333-r1-b',
    iso('2026-01-01T10:00:00Z'),
    iso('2026-01-01T10:30:00Z')
  ),
  activity(
    3,
    '222-r1',
    iso('2026-01-01T10:30:00Z'),
    iso('2026-01-01T11:00:00Z')
  ),
  activity(
    4,
    '444-r1',
    iso('2026-01-01T11:30:00Z'),
    iso('2026-01-01T12:00:00Z')
  ),
];

const tests: Array<{ name: string; run: () => void }> = [
  {
    name: 'starts the first scheduled group when nothing is running',
    run: () => {
      const plan = determineAutoAdvancePlan({
        activities,
        activityHistory: [],
        autoAdvanceDelaySeconds: 0,
        now: new Date('2026-01-01T09:55:00Z'),
      });

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T10:00:00Z'));
      assert.deepEqual(
        plan.startActivities.map((item) => item.id),
        [1, 2]
      );
      assert.deepEqual(plan.stopActivities, []);
    },
  },
  {
    name: 'starts overdue activities immediately instead of getting stuck',
    run: () => {
      const plan = determineAutoAdvancePlan({
        activities,
        activityHistory: [],
        autoAdvanceDelaySeconds: 0,
        now: new Date('2026-01-01T10:05:00Z'),
      });

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T10:05:00Z'));
      assert.deepEqual(
        plan.startActivities.map((item) => item.id),
        [1, 2]
      );
    },
  },
  {
    name: 'stops running activities and starts the next group at transition time',
    run: () => {
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

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T10:30:00Z'));
      assert.deepEqual(
        plan.stopActivities.map((item) => item.id),
        [1, 2]
      );
      assert.deepEqual(
        plan.startActivities.map((item) => item.id),
        [3]
      );
    },
  },
  {
    name: 'preserves a schedule gap by stopping first and starting later on the next pass',
    run: () => {
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

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T11:00:00Z'));
      assert.deepEqual(
        plan.stopActivities.map((item) => item.id),
        [3]
      );
      assert.deepEqual(plan.startActivities, []);
    },
  },
  {
    name: 'applies the configured auto advance delay',
    run: () => {
      const plan = determineAutoAdvancePlan({
        activities,
        activityHistory: [],
        autoAdvanceDelaySeconds: 15,
        now: new Date('2026-01-01T09:55:00Z'),
      });

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T10:00:15Z'));
    },
  },
  {
    name: 'uses a queued start time when an activity is intentionally scheduled',
    run: () => {
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

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T10:20:00Z'));
      assert.deepEqual(
        plan.startActivities.map((item) => item.id),
        [3]
      );
    },
  },
  {
    name: 'uses a queued end time to extend or shorten the running activity',
    run: () => {
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

      assert(plan);
      assert.equal(plan.jobTime.toISOString(), iso('2026-01-01T10:45:00Z'));
      assert.deepEqual(
        plan.stopActivities.map((item) => item.id),
        [1]
      );
      assert.deepEqual(
        plan.startActivities.map((item) => item.id),
        [3]
      );
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
