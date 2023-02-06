import { AppContext } from '../../../server';
import {
  CompetitionResolvers,
  Header,
  HttpMethod,
} from '../../../generated/graphql';

export const webhooks: CompetitionResolvers<AppContext>['webhooks'] = async (
  parent,
  _,
  { user, db }
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
    ...(user?.id === 8184 && {
      headers: (w.headers as Header[]) || [],
    }),
  }));
};
