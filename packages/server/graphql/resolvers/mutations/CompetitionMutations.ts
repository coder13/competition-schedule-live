import { AppContext } from '../../../server';
import { MutationResolvers } from '../../../generated/graphql';

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
        1000 * 60 * 60 * 24 * competition.schedule.numberOfDays
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

    return newCompetition;
  };
