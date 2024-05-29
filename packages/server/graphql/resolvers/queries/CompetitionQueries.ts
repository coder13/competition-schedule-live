import { AppContext } from '../../../server';
import { QueryResolvers, Status } from '../../../generated/graphql';

export const competitions: QueryResolvers<AppContext>['competitions'] = async (
  _,
  { competitionIds },
  { db }
) => {
  return (
    await db.competition.findMany({
      include: {
        activityHistory: true,
      },
      where: {
        ...(competitionIds && {
          id: {
            in: competitionIds,
            mode: 'insensitive',
          },
        }),
      },
    })
  ).map((comp) => ({
    ...comp,
    status: comp.status as Status,
  }));
};

export const competition: QueryResolvers<AppContext>['competition'] = async (
  _,
  { competitionId },
  { db }
) => {
  const comp = await db.competition.findFirst({
    include: {
      activityHistory: true,
    },
    where: {
      id: {
        equals: competitionId,
        mode: 'insensitive',
      },
    },
  });

  if (!comp) {
    return null;
  }

  return {
    ...comp,
    status: comp.status as Status,
  };
};
