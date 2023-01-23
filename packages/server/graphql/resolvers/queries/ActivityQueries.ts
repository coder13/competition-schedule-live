import { AppContext } from '../../../server';
import { QueryResolvers } from '../../../generated/graphql';

export const activities: QueryResolvers<AppContext>['activities'] = async (
  _,
  { competitionId },
  { db }
) => {
  return db.activityHistory.findMany({
    where: {
      competitionId: {
        equals: competitionId,
        mode: 'insensitive',
      },
    },
  });
};
