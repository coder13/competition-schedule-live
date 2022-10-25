import { CompetitionQueries } from './Competition';
import { CompetitionAccessQueries } from './CompetitionAccess';
import {
  ActivityQueries,
  ActivityMutations,
  ActivitySubscriptions,
} from './Activities';

const Resolvers = {
  Query: {
    ...CompetitionQueries,
    ...CompetitionAccessQueries,
    ...ActivityQueries,
  },
  Mutation: {
    ...ActivityMutations,
  },
  Subscription: {
    ...ActivitySubscriptions,
  },
};

export default Resolvers;
