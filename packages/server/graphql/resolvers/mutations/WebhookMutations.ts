import { HttpMethod, MutationResolvers } from '../../../generated/graphql';
import { AppContext } from '../../../server';

export const createWebhook: MutationResolvers<AppContext>['createWebhook'] =
  async (_, { competitionId, webhook }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const wh = await db.webhook.create({
      data: {
        competitionId,
        url: webhook.url,
        method: webhook.method,
      },
    });

    console.log(18, wh);

    return {
      id: wh.id,
      url: wh.url,
      method: wh.method as HttpMethod,
      headers: [],
    };
  };

export const updateWebhook: MutationResolvers<AppContext>['updateWebhook'] =
  async (_, { id, webhook }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const wh = await db.webhook.update({
      where: {
        id,
      },
      data: {
        url: webhook.url,
        method: webhook.method,
      },
    });

    return {
      id: wh.id,
      url: wh.url,
      method: wh.method as HttpMethod,
      headers: [],
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
