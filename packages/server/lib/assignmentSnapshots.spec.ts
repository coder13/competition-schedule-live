import {
  createAssignmentSnapshot,
  hashAssignments,
} from './assignmentSnapshots';

describe('assignment snapshots', () => {
  it('hashes assignments stably regardless of object key order', () => {
    const first = hashAssignments([
      {
        activityId: 1,
        assignmentCode: 'competitor',
        stationNumber: 3,
      },
    ]);
    const second = hashAssignments([
      {
        stationNumber: 3,
        assignmentCode: 'competitor',
        activityId: 1,
      },
    ]);

    expect(first).toBe(second);
  });

  it('creates a snapshot for the matching person', () => {
    expect(
      createAssignmentSnapshot(
        {
          id: 'TestComp2026',
          persons: [
            {
              wcaUserId: 123,
              assignments: [{ activityId: 1, assignmentCode: 'staff' }],
            },
          ],
        },
        123
      )
    ).toEqual({
      competitionId: 'TestComp2026',
      wcaUserId: 123,
      assignmentsHash: hashAssignments([
        { activityId: 1, assignmentCode: 'staff' },
      ]),
    });
  });

  it('returns null when no person matches', () => {
    expect(
      createAssignmentSnapshot({ id: 'TestComp2026', persons: [] }, 123)
    ).toBeNull();
  });

  it('treats missing assignments as an empty assignment list', () => {
    const snapshot = createAssignmentSnapshot(
      {
        id: 'TestComp2026',
        persons: [{ wcaUserId: 123 }],
      },
      123
    );

    expect(snapshot?.assignmentsHash).toBe(hashAssignments([]));
  });
});
