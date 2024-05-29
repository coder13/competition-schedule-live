import { AppContext } from '../../../server';
import { Competition, UserResolvers } from '../../../generated/graphql';
import { ActivityHistory } from '../../../prisma/generated/client';

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
  }) as Promise<Array<Competition & { activityHistory: ActivityHistory[] }>>;
