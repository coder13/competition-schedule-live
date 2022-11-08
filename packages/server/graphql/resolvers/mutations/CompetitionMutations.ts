import { AppContext } from '../../..';
import { MutationResolvers } from '../../../generated/graphql';

export const importCompetition: MutationResolvers<AppContext>['importCompetition'] =
  async (_, { competitionId }, { db, wcaApi, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const competition = await wcaApi.getWcif(competitionId);
    console.log(11, competition);

    const delegatesAndOrganizers = competition.persons.filter(
      (person) =>
        person.roles?.includes('delegate') ??
        person.roles?.includes('trainee-delegate') ??
        person.roles?.includes('organizer')
    );

    const newCompetition = await db.competition.create({
      include: {
        competitionAccess: true,
      },
      data: {
        id: competition.id,
        name: competition.name,
        startDate: competition.schedule.startDate,
        endDate: competition.schedule.startDate,
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
