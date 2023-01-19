import { AppContext } from '../../../server';
import { CompetitionResolvers } from '../../../generated/graphql';

export const activities: CompetitionResolvers<AppContext>['activities'] =
  async (parent, { ongoing }, { db }) => {
    return db.activityHistory.findMany({
      where: {
        competitionId: parent.id,
        ...(ongoing && { endTime: null }),
      },
    });
  };
