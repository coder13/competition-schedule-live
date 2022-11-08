import { AppContext } from '../../..';
import { CompetitionResolvers } from '../../../generated/graphql';

export const activities: CompetitionResolvers<AppContext>['activities'] =
  async (parent, __, { db }) => {
    return db.activityHistory.findMany({
      where: {
        competitionId: parent.id,
      },
    });
  };
