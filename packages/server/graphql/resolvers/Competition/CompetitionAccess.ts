import { AppContext } from '../../..';
import { CompetitionResolvers } from '../../../generated/graphql';

export const competitionAccess: CompetitionResolvers<AppContext>['competitionAccess'] =
  async (parent, _, { db }) => {
    return db.competitionAccess.findMany({
      where: {
        competitionId: parent.id,
      },
    });
  };
