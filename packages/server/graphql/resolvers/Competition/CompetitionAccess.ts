import { AppContext } from '../../../server';
import { CompetitionResolvers } from '../../../generated/graphql';

export const competitionAccess: CompetitionResolvers<AppContext>['competitionAccess'] =
  async (parent, _, { db }) => {
    return db.competitionAccess.findMany({
      where: {
        competitionId: {
          equals: parent.id,
          mode: 'insensitive',
        },
      },
    });
  };
