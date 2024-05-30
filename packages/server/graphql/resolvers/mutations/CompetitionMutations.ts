import { AppContext } from '../../../server';
import { Competition, MutationResolvers } from '../../../generated/graphql';
import {
  CompetitionActivitiesJobsMap,
  determineAndScheduleCompetition,
} from '../../../scheduler';
import { fetchCompWithNoScheduledActivities } from '../../../scheduler/utils';

export const importCompetition: MutationResolvers<AppContext>['importCompetition'] =
  async (_, { competitionId }, { db, wcaApi, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const competition = await wcaApi.getWcif(competitionId);

    const delegatesAndOrganizers = competition.persons.filter(
      (person) =>
        person.roles?.includes('delegate') ??
        person.roles?.includes('trainee-delegate') ??
        person.roles?.includes('organizer')
    );

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
  async (_, { competitionId, autoAdvance }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

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

      for (const key in CompetitionActivitiesJobsMap.keys()) {
        if (key.includes(competitionId)) {
          CompetitionActivitiesJobsMap.get(key)?.job?.cancel();
          CompetitionActivitiesJobsMap.delete(key);
        }
      }
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
      },
    })) as Competition;
  };
