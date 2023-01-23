import { AppContext } from '../../../server';
import { CompetitionResolvers } from '../../../generated/graphql';

export const activities: CompetitionResolvers<AppContext>['activities'] =
  async (parent, { ongoing }, { db }) => {
    return db.activityHistory.findMany({
      where: {
        competitionId: {
          equals: parent.id,
          mode: 'insensitive',
        },
        ...(ongoing && { endTime: null }),
      },
    });
  };
