import * as queries from './queries';
import * as mutations from './mutations';
import * as subscriptions from './subscriptions';
import * as CompetitionResolvers from './Competition';
import * as UserResolvers from './User';

const Resolvers = {
  Query: queries,
  Mutation: mutations,
  Subscription: subscriptions,
  Competition: CompetitionResolvers,
  User: UserResolvers,
};

export default Resolvers;
