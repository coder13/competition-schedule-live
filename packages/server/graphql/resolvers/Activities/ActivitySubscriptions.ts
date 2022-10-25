import { withFilter } from 'graphql-subscriptions';
import { SubscriptionResolvers } from '../../../generated/graphql';

export const activityStarted: SubscriptionResolvers['activityStarted'] = {
  // @ts-expect-error withfilter isn't properly typed.
  subscribe: withFilter(
    (_, args, { pubsub }) => pubsub.asyncIterator('ACTIVITY_STARTED'),
    (payload, args) =>
      payload.activityStarted.competitionId === args.competitionId
  ),
};

export const activityStopped: SubscriptionResolvers['activityStopped'] = {
  // @ts-expect-error withfilter isn't properly typed.
  subscribe: withFilter(
    (_, args, { pubsub }) => pubsub.asyncIterator('ACTIVITY_STOPPED'),
    (payload, args) =>
      payload.activityStopped.competitionId === args.competitionId
  ),
};
