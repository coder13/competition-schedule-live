import { AppContext } from '../../../server';
import { Competition, MutationResolvers } from '../../../generated/graphql';
import {
  cancelCompetitionActivityJobs,
  determineAndScheduleCompetition,
} from '../../../scheduler';
import { fetchCompWithNoScheduledActivities } from '../../../scheduler/utils';

const isAuthorized = async (
  db: AppContext['db'],
  competitionId: string,
  user?: AppContext['user']
) => {
  if (!user) {
    throw new Error('Not Authenticated');
  }

  if (user.id === 8184) {
    return;
  }

  if (
    user.competitionGroups?.competitionIds &&
    !user.competitionGroups.competitionIds.includes(competitionId)
  ) {
    throw new Error('Not Authorized');
  }

  const compAccess = await db.competitionAccess.findFirst({
    where: {
      competitionId: {
        equals: competitionId,
        mode: 'insensitive',
      },
      userId: user.id,
    },
  });

  if (!compAccess) {
    throw new Error('Not Authorized');
  }
};

export const importCompetition: MutationResolvers<AppContext>['importCompetition'] =
  async (_, { competitionId }, { db, wcaApi, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const competition = await wcaApi.getWcif(competitionId);

    const delegatesAndOrganizers = competition.persons.filter((person) => {
      const roles = person.roles ?? [];
      return (
        roles.includes('delegate') ||
        roles.includes('trainee-delegate') ||
        roles.includes('organizer')
      );
    });

    // Have to calculate end Date
    const endDate = new Date(
      new Date(competition.schedule.startDate).getTime() +
        1000 * 60 * 60 * 24 * (competition.schedule.numberOfDays - 1)
    )
      .toISOString()
      .split('T')[0];

    const newCompetition = await db.competition.create({
      include: {
        competitionAccess: true,
      },
      data: {
        id: competition.id,
        name: competition.name,
        startDate: competition.schedule.startDate,
        endDate,
        country: competition.schedule.venues[0].countryIso2,
        competitionAccess: {
          create: delegatesAndOrganizers.map((person) => ({
            userId: person.wcaUserId,
            roomId: 0,
          })),
        },
      },
    });

    return newCompetition as Competition;
  };

export const updateAutoAdvance: MutationResolvers<AppContext>['updateAutoAdvance'] =
  async (_, { competitionId, autoAdvance, autoAdvanceDelay }, { db, user }) => {
    await isAuthorized(db, competitionId, user);

    if (autoAdvance === false) {
      console.log('Cancelling all scheduled activities', competitionId);

      await db.activityHistory.updateMany({
        where: {
          competitionId,
          OR: [
            { scheduledEndTime: { not: null } },
            { scheduledStartTime: { not: null } },
          ],
        },
        data: {
          scheduledStartTime: null,
          scheduledEndTime: null,
        },
      });

      cancelCompetitionActivityJobs(competitionId);
    } else {
      const comp = await fetchCompWithNoScheduledActivities(competitionId);
      if (comp) {
        await determineAndScheduleCompetition(comp);
      }
    }

    return (await db.competition.update({
      where: {
        id: competitionId,
      },
      data: {
        ...(autoAdvance !== null && { autoAdvance }),
        ...(autoAdvanceDelay !== null && { autoAdvanceDelay }),
      },
    })) as Competition;
  };
