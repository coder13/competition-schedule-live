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

  if (user.competitionGroups) {
    const allowedCompetitionIds = (
      user.competitionGroups.competitionIds ?? []
    ).map((id) => id.toLowerCase());

    if (!allowedCompetitionIds.includes(competitionId.toLowerCase())) {
      throw new Error('Not Authorized');
    }

    return;
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

const getCompetitionImportMetadata = (
  competition: Awaited<ReturnType<AppContext['wcaApi']['getWcif']>>,
  requestedCompetitionId: string
) => {
  if (
    !competition?.id ||
    competition.id.toLowerCase() !== requestedCompetitionId.toLowerCase()
  ) {
    throw new Error('WCIF competition ID did not match requested competition');
  }

  if (!competition.name) {
    throw new Error('WCIF competition is missing a name');
  }

  if (
    !competition.schedule?.startDate ||
    !Number.isInteger(competition.schedule.numberOfDays) ||
    competition.schedule.numberOfDays < 1
  ) {
    throw new Error('WCIF competition has an invalid schedule');
  }

  const country = competition.schedule.venues?.[0]?.countryIso2;
  if (!country) {
    throw new Error('WCIF competition is missing a venue country');
  }

  const startDate = new Date(competition.schedule.startDate);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error('WCIF competition has an invalid start date');
  }

  const endDate = new Date(
    startDate.getTime() +
      1000 * 60 * 60 * 24 * (competition.schedule.numberOfDays - 1)
  )
    .toISOString()
    .split('T')[0];

  return {
    country,
    endDate,
  };
};

export const importCompetition: MutationResolvers<AppContext>['importCompetition'] =
  async (_, { competitionId }, { db, wcaApi, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const competition = await wcaApi.getWcif(competitionId);
    const { country, endDate } = getCompetitionImportMetadata(
      competition,
      competitionId
    );

    const delegatesAndOrganizers = competition.persons.filter((person) => {
      const roles = person.roles ?? [];
      return (
        roles.includes('delegate') ||
        roles.includes('trainee-delegate') ||
        roles.includes('organizer')
      );
    });
    const accessRows = delegatesAndOrganizers
      .filter((person) => Number.isInteger(person.wcaUserId))
      .map((person) => ({
        competitionId: competition.id,
        userId: person.wcaUserId,
        roomId: 0,
      }));

    const newCompetition = await db.$transaction(async (tx) => {
      await tx.competition.upsert({
        where: {
          id: competition.id,
        },
        update: {
          name: competition.name,
          startDate: competition.schedule.startDate,
          endDate,
          country,
        },
        create: {
          id: competition.id,
          name: competition.name,
          startDate: competition.schedule.startDate,
          endDate,
          country,
          autoAdvance: false,
        },
      });

      if (accessRows.length) {
        await tx.competitionAccess.createMany({
          data: accessRows,
          skipDuplicates: true,
        });
      }

      return tx.competition.findFirstOrThrow({
        where: {
          id: competition.id,
        },
        include: {
          competitionAccess: true,
        },
      });
    });

    return newCompetition as Competition;
  };

export const updateAutoAdvance: MutationResolvers<AppContext>['updateAutoAdvance'] =
  async (_, { competitionId, autoAdvance, autoAdvanceDelay }, { db, user }) => {
    await isAuthorized(db, competitionId, user);

    if (
      autoAdvanceDelay !== null &&
      autoAdvanceDelay !== undefined &&
      autoAdvanceDelay < 0
    ) {
      throw new Error('Auto advance delay must be non-negative');
    }

    if (autoAdvance === false) {
      console.log('Cancelling all scheduled activities', competitionId);

      const updatedCompetition = await db.$transaction(async (tx) => {
        await tx.activityHistory.updateMany({
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

        return tx.competition.update({
          where: {
            id: competitionId,
          },
          data: {
            autoAdvance: false,
            ...(autoAdvanceDelay != null && { autoAdvanceDelay }),
          },
        });
      });

      cancelCompetitionActivityJobs(competitionId);

      return updatedCompetition as Competition;
    }

    const updatedCompetition = (await db.competition.update({
      where: {
        id: competitionId,
      },
      data: {
        ...(autoAdvance != null && { autoAdvance }),
        ...(autoAdvanceDelay != null && { autoAdvanceDelay }),
      },
    })) as Competition;

    if (autoAdvance === true) {
      const comp = await fetchCompWithNoScheduledActivities(competitionId);
      if (comp) {
        await determineAndScheduleCompetition(comp);
      }
    }

    return updatedCompetition;
  };
