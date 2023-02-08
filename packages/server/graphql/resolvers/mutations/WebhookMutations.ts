import { webhookFetch } from '../../../controllers/webhooks';
import {
  Header,
  HttpMethod,
  MutationResolvers,
} from '../../../generated/graphql';
import { HTTPMethod } from '../../../prisma/generated/client';
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

export const testWebhooks: MutationResolvers<AppContext>['testWebhooks'] =
  async (_, { competitionId }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const competition = await db.competition.findFirst({
      where: {
        id: {
          equals: competitionId,
          mode: 'insensitive',
        },
      },
      include: {
        competitionAccess: true,
        webhooks: true,
      },
    });

    if (!competition) {
      throw new Error('Competition not found');
    }

    if (
      !(
        !!competition?.competitionAccess?.some((ca) => ca.userId === user.id) ||
        user.id === 8184
      )
    ) {
      throw new Error('Not Authorized');
    }

    const whs = competition?.webhooks;

    if (!whs) {
      throw new Error('Webhooks not found');
    }

    const responses = await Promise.all(
      whs.map(async (wh) => {
        try {
          const res = await webhookFetch(wh, {
            competitionId: competition.id,
            notifications: [
              {
                type: 'ping',
              },
            ],
          });

          return {
            url: wh.url,
            status: res.status,
            statusText: res.statusText,
            body: await res.text(),
          };
        } catch (e) {
          console.error(e);
          return {
            url: wh.url,
            status: 0,
            statusText: '',
            body: '',
          };
        }
      })
    );

    return responses;
  };

export const testWebhook: MutationResolvers<AppContext>['testWebhook'] = async (
  _,
  { id },
  { db, user }
) => {
  if (!user) {
    throw new Error('Not Authenticated');
  }

  const competition = await db.competition.findFirst({
    where: {
      webhooks: {
        some: {
          id,
        },
      },
    },
    include: {
      competitionAccess: true,
      webhooks: true,
    },
  });

  if (!competition) {
    throw new Error('Competition not found');
  }

  if (
    !(
      !!competition?.competitionAccess?.some((ca) => ca.userId === user.id) ||
      user.id === 8184
    )
  ) {
    throw new Error('Not Authorized');
  }

  const wh = competition?.webhooks.find((wh) => wh.id === id);

  if (!wh) {
    throw new Error('Webhook not found');
  }

  const res = await webhookFetch(wh, {
    competitionId: competition.id,
    notifications: [
      {
        type: 'ping',
      },
    ],
  });

  return {
    url: wh.url,
    status: res.status,
    statusText: res.statusText,
    body: await res.text(),
  };
};

export const testEditingWebhook: MutationResolvers<AppContext>['testEditingWebhook'] =
  async (_, { competitionId, webhook }, { db, user }) => {
    if (!user) {
      throw new Error('Not Authenticated');
    }

    const res = await webhookFetch(
      {
        id: 0,
        competitionId,
        url: webhook.url,
        method: webhook.method as HTTPMethod,
        headers: [],
      },
      {
        competitionId,
        notifications: [
          {
            type: 'ping',
          },
        ],
      }
    );

    return {
      url: webhook.url,
      status: res.status,
      statusText: res.statusText,
      body: await res.text(),
    };
  };
