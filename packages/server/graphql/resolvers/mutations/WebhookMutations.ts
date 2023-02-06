import {
  Header,
  HttpMethod,
  MutationResolvers,
} from '../../../generated/graphql';
import { AppContext } from '../../../server';

export const createWebhook: MutationResolvers<AppContext>['createWebhook'] =
  async (_, { competitionId, webhook }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const comp = await db.competition.findFirst({
      where: {
        id: {
          equals: competitionId,
          mode: 'insensitive',
        },
      },
      include: {
        competitionAccess: true,
      },
    });

    if (
      !(
        !!comp?.competitionAccess?.some((ca) => ca.userId === user.id) ||
        user.id === 8184
      )
    ) {
      throw new Error('Not Authorized');
    }

    const wh = await db.webhook.create({
      data: {
        competitionId,
        url: webhook.url,
        method: webhook.method,
        ...(user.id === 8184 && {
          headers:
            webhook.headers?.map((wh) => ({
              key: wh.key,
              value: wh.value,
            })) ?? [],
        }),
      },
    });

    return {
      id: wh.id,
      url: wh.url,
      method: wh.method as HttpMethod,
      ...(user.id === 8184 && { headers: (wh.headers as Header[]) || [] }),
    };
  };

export const updateWebhook: MutationResolvers<AppContext>['updateWebhook'] =
  async (_, { id, webhook }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const comp = await db.competition.findFirst({
      where: {
        webhooks: {
          some: {
            id,
          },
        },
      },
      include: {
        competitionAccess: true,
      },
    });

    if (
      !(
        !!comp?.competitionAccess?.some((ca) => ca.userId === user.id) ||
        user.id === 8184
      )
    ) {
      throw new Error('Not Authorized');
    }

    const wh = await db.webhook.update({
      where: {
        id,
      },
      data: {
        url: webhook.url,
        method: webhook.method,
        ...(user.id === 8184 && {
          headers:
            webhook.headers?.map((h) => ({
              key: h.key,
              value: h.value,
            })) ?? [],
        }),
      },
    });

    console.log(13, wh);

    return {
      id: wh.id,
      url: wh.url,
      method: wh.method as HttpMethod,
      ...(user.id === 8184 && { headers: (wh.headers as Header[]) ?? [] }),
    };
  };

export const deleteWebhook: MutationResolvers<AppContext>['deleteWebhook'] =
  async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    await db.webhook.delete({
      where: {
        id,
      },
    });

    return undefined;
  };
