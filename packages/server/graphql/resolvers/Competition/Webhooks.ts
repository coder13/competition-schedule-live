import { AppContext } from '../../../server';
import { CompetitionResolvers, HttpMethod } from '../../../generated/graphql';

export const webhooks: CompetitionResolvers<AppContext>['webhooks'] = async (
  parent,
  _,
  { db }
) => {
  return (
    await db.webhook.findMany({
      where: {
        competitionId: {
          equals: parent.id,
          mode: 'insensitive',
        },
      },
    })
  ).map((w) => ({
    id: w.id,
    url: w.url,
    method: w.method as HttpMethod,
  }));
};
