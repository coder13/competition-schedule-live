import * as queries from './queries';
import * as mutations from './mutations';
import * as subscriptions from './subscriptions';
import * as CompetitionResolvers from './Competition';

const Resolvers = {
  Query: queries,
  Mutation: mutations,
  Subscription: subscriptions,
  Competition: CompetitionResolvers,
};

export default Resolvers;
