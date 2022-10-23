import { CompetitionQueries } from './Competition';
import { CompetitionAccessQueries } from './CompetitionAccess';

const Resolvers = {
  Query: {
    ...CompetitionQueries,
    ...CompetitionAccessQueries,
  },
};

export default Resolvers;
