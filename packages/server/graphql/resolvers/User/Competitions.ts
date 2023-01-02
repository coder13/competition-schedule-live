import { AppContext } from '../../..';
import { UserResolvers } from '../../../generated/graphql';

export const competitions: UserResolvers<AppContext>['competitions'] = async (
  parent,
  __,
  { db }
) =>
  db.competition.findMany({
    include: {
      activityHistory: true,
    },
    where: {
      competitionAccess: {
        some: {
          userId: parent.id,
        },
      },
    },
  });
