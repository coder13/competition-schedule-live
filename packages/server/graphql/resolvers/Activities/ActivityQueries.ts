import { AppContext } from '../../..';
import { QueryResolvers } from '../../../generated/graphql';

export const activities: QueryResolvers<AppContext>['activities'] = async (
  _,
  { competitionId },
  { db }
) => {
  // I don't fucking know but it makes eslint happy
  return db.activityHistory.findMany({
    where: {
      competitionId,
    },
  });
};
