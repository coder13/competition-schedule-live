import { competitionFixture } from '../test/helpers';
import { createNotificationsForActivity } from './notifications';

describe('createNotificationsForActivity', () => {
  it('creates activity and competitor notifications for selected activities', () => {
    expect(
      createNotificationsForActivity(
        competitionFixture({
          id: 'TestComp2026',
          persons: [
            {
              wcaUserId: 123,
              registrantId: 5,
              name: 'Test Competitor',
              wcaId: '2026TEST01',
              countryIso2: 'US',
              extensions: [],
              assignments: [
                {
                  activityId: 1,
                  assignmentCode: 'competitor',
                  stationNumber: null,
                },
                { activityId: 2, assignmentCode: 'staff', stationNumber: null },
              ],
            },
            {
              wcaUserId: 456,
              registrantId: 6,
              name: 'Other Competitor',
              countryIso2: 'US',
              extensions: [],
              assignments: [
                {
                  activityId: 3,
                  assignmentCode: 'competitor',
                  stationNumber: null,
                },
              ],
            },
          ],
        }),
        [1]
      )
    ).toEqual({
      competitionId: 'TestComp2026',
      notifications: [
        { type: 'activity', id: 1 },
        {
          type: 'competitor',
          activityId: 1,
          wcaUserId: 123,
          registrantId: 5,
          name: 'Test Competitor',
          wcaId: '2026TEST01',
          assignmentCode: 'competitor',
        },
      ],
    });
  });
});
