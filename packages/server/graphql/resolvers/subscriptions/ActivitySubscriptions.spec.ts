/* eslint-disable import/first */
interface CapturedFilter {
  iterator: (parent: unknown, args: unknown, context: unknown) => unknown;
  filter: (payload: Record<string, unknown>, args: Record<string, unknown>) => boolean;
}

const withFilter = jest.fn(
  (
    iterator: CapturedFilter['iterator'],
    filter: CapturedFilter['filter']
  ): CapturedFilter => ({
    iterator,
    filter,
  })
);

jest.mock('graphql-subscriptions', () => ({
  withFilter,
}));

import {
  activityStarted,
  activityStopped,
  activityUpdated,
} from './ActivitySubscriptions';

const getSubscription = (value: unknown) => value as { subscribe: CapturedFilter };

describe('activity subscriptions', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('subscribes to pubsub channels', () => {
    const pubsub = {
      asyncIterator: jest.fn().mockReturnValue('iterator'),
    };

    expect(
      getSubscription(activityUpdated).subscribe.iterator({}, {}, { pubsub })
    ).toBe('iterator');
    expect(pubsub.asyncIterator).toHaveBeenCalledWith('ACTIVITY_UPDATED');
  });

  it('filters started and stopped events by competition', () => {
    expect(
      getSubscription(activityStarted).subscribe.filter(
        { activityStarted: { competitionId: 'TestComp2026' } },
        { competitionId: 'TestComp2026' }
      )
    ).toBe(true);

    expect(
      getSubscription(activityStopped).subscribe.filter(
        {
          activityUpdated: {
            activityStopped: { competitionId: 'OtherComp2026' },
          },
        },
        { competitionId: 'TestComp2026' }
      )
    ).toBe(false);
  });

  it('filters updated events by competition IDs and room ID', () => {
    const filter = getSubscription(activityUpdated).subscribe.filter;

    expect(
      filter(
        { activityUpdated: { competitionId: 'TestComp2026', roomId: 1 } },
        { competitionIds: ['testcomp2026'], roomId: 1 }
      )
    ).toBe(true);
    expect(
      filter(
        { activityUpdated: { competitionId: 'OtherComp2026', roomId: 1 } },
        { competitionIds: ['testcomp2026'], roomId: 1 }
      )
    ).toBe(false);
    expect(
      filter(
        { activityUpdated: { competitionId: 'TestComp2026', roomId: 2 } },
        { competitionIds: ['testcomp2026'], roomId: 1 }
      )
    ).toBe(false);
  });
});
