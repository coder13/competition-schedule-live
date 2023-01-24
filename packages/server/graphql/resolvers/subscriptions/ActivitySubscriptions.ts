import { withFilter } from 'graphql-subscriptions';
import { SubscriptionResolvers } from '../../../generated/graphql';

export const activityStarted: SubscriptionResolvers['activityStarted'] = {
  // @ts-expect-error withfilter isn't properly typed.
  subscribe: withFilter(
    (_, __, { pubsub }) => pubsub.asyncIterator('ACTIVITY_STARTED'),
    (payload, args) =>
      payload.activityStarted.competitionId === args.competitionId
  ),
};

export const activityStopped: SubscriptionResolvers['activityStopped'] = {
  // @ts-expect-error withfilter isn't properly typed.
  subscribe: withFilter(
    (_, __, { pubsub }) => pubsub.asyncIterator('ACTIVITY_STOPPED'),
    (payload, args) =>
      payload.activityUpdated.activityStopped.competitionId ===
      args.competitionId
  ),
};

export const activityUpdated: SubscriptionResolvers['activityUpdated'] = {
  // @ts-expect-error withfilter isn't properly typed.
  subscribe: withFilter(
    (_, __, { pubsub }) => pubsub.asyncIterator('ACTIVITY_UPDATED'),
    (payload, args) => {
      console.log(payload.activityUpdated);
      if (args.competitionIds.includes(payload.activityUpdated.competitionId)) {
        return false;
      }

      if (args.roomId && args.roomId !== payload.activityUpdated.roomId) {
        return false;
      }

      return true;
    }
  ),
};
