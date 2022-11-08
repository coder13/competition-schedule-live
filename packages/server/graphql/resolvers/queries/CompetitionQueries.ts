import { AppContext } from '../../..';
import { QueryResolvers } from '../../../generated/graphql';

export const competitions: QueryResolvers<AppContext>['competitions'] = async (
  _,
  __,
  { db }
) => {
  return db.competition.findMany({
    include: {
      activityHistory: true,
    },
  });
};

export const competition: QueryResolvers<AppContext>['competition'] = async (
  _,
  { competitionId },
  { db }
) => {
  return db.competition.findFirst({
    include: {
      activityHistory: true,
    },
    where: {
      id: competitionId,
    },
  });
};
