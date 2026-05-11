/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createAssignmentSnapshot,
  hashAssignments,
} = require('../lib/assignmentSnapshots');

test('hashAssignments is stable when assignment object keys are reordered', () => {
  const first = [
    {
      activityId: 123,
      assignmentCode: 'competitor',
      stationNumber: 4,
    },
  ];
  const second = [
    {
      stationNumber: 4,
      assignmentCode: 'competitor',
      activityId: 123,
    },
  ];

  assert.equal(hashAssignments(first), hashAssignments(second));
});

test('createAssignmentSnapshot returns the watched user assignment hash', () => {
  const wcif = {
    id: 'ExampleOpen2026',
    persons: [
      {
        wcaUserId: 12,
        assignments: [{ activityId: 1, assignmentCode: 'staff-judge' }],
      },
      {
        wcaUserId: 34,
        assignments: [{ activityId: 2, assignmentCode: 'competitor' }],
      },
    ],
  };

  assert.deepEqual(createAssignmentSnapshot(wcif, 34), {
    competitionId: 'ExampleOpen2026',
    wcaUserId: 34,
    assignmentsHash: hashAssignments([
      { activityId: 2, assignmentCode: 'competitor' },
    ]),
  });
});

test('createAssignmentSnapshot returns null when the watched user is absent', () => {
  assert.equal(
    createAssignmentSnapshot({ id: 'ExampleOpen2026', persons: [] }, 34),
    null
  );
});
