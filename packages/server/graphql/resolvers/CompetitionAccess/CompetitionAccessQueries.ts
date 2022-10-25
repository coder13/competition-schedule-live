import { AppContext } from '../../..';
import { QueryResolvers } from '../../../generated/graphql';

export const competitionAccess: QueryResolvers<AppContext>['competitionAccess'] =
  async (_, { competitionId }, { db }) => {
    return db.competitionAccess.findMany({
      where: {
        competitionId,
      },
    });
  };
