import { webhookFetch } from '../../../controllers/webhooks';
import {
  Header,
  HttpMethod,
  MutationResolvers,
} from '../../../generated/graphql';
import { HTTPMethod } from '../../../prisma/generated/client';
import { AppContext } from '../../../server';
import { assertValidWebhookUrl } from '../../../lib/webhookUrls';
import { runWithConcurrency } from '../../../lib/runWithConcurrency';

const canAccessCompetition = (
  user: User,
  competitionId: string,
  competitionAccess?: Array<{ userId: number }>
) =>
  user.id === 8184 ||
  Boolean(
    (user.competitionGroups?.competitionIds ?? [])
      .map((id) => id.toLowerCase())
      .includes(competitionId.toLowerCase())
  ) ||
  Boolean(competitionAccess?.some((ca) => ca.userId === user.id));

const findCompetitionForWebhook = (db: AppContext['db'], id: number) =>
  db.competition.findFirst({
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

const webhookTestConcurrency = () => {
  const value = Number(process.env.WEBHOOK_DELIVERY_CONCURRENCY);
  return Number.isInteger(value) && value > 0 ? value : 5;
};

const requireCompetitionAccess = async ({
  db,
  user,
  competitionId,
  webhookId,
}: {
  db: AppContext['db'];
  user?: AppContext['user'];
  competitionId?: string;
  webhookId?: number;
}) => {
  if (!user) {
    throw new Error('Not Authenticated');
  }

  const competition = competitionId
    ? await db.competition.findFirst({
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
      })
    : await findCompetitionForWebhook(db, Number(webhookId));

  if (!competition) {
    throw new Error('Competition not found');
  }

  const resolvedCompetitionId = competition.id ?? competitionId;
  if (
    !resolvedCompetitionId ||
    !canAccessCompetition(
      user,
      resolvedCompetitionId,
      competition.competitionAccess
    )
  ) {
    throw new Error('Not Authorized');
  }

  return { competition, user };
};

export const createWebhook: MutationResolvers<AppContext>['createWebhook'] =
  async (_, { competitionId, webhook }, { db, user }) => {
    const { user: authorizedUser } = await requireCompetitionAccess({
      db,
      user,
      competitionId,
    });
    const url = assertValidWebhookUrl(webhook.url);

    const wh = await db.webhook.create({
      data: {
        competitionId,
        url,
        method: webhook.method,
        ...(authorizedUser.id === 8184 && {
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
      ...(authorizedUser.id === 8184 && {
        headers: (wh.headers as Header[]) || [],
      }),
    };
  };

export const updateWebhook: MutationResolvers<AppContext>['updateWebhook'] =
  async (_, { id, webhook }, { db, user }) => {
    const { user: authorizedUser } = await requireCompetitionAccess({
      db,
      user,
      webhookId: id,
    });
    const url = assertValidWebhookUrl(webhook.url);

    const wh = await db.webhook.update({
      where: {
        id,
      },
      data: {
        url,
        method: webhook.method,
        ...(authorizedUser.id === 8184 && {
          headers:
            webhook.headers?.map((h) => ({
              key: h.key,
              value: h.value,
            })) ?? [],
        }),
      },
    });

    return {
      id: wh.id,
      url: wh.url,
      method: wh.method as HttpMethod,
      ...(authorizedUser.id === 8184 && {
        headers: (wh.headers as Header[]) ?? [],
      }),
    };
  };

export const deleteWebhook: MutationResolvers<AppContext>['deleteWebhook'] =
  async (_, { id }, { db, user }) => {
    await requireCompetitionAccess({ db, user, webhookId: id });

    await db.webhook.delete({
      where: {
        id,
      },
    });

    return undefined;
  };

export const testWebhooks: MutationResolvers<AppContext>['testWebhooks'] =
  async (_, { competitionId }, { db, user }) => {
    const { competition } = await requireCompetitionAccess({
      db,
      user,
      competitionId,
    });

    const whs = competition?.webhooks;

    if (!whs) {
      throw new Error('Webhooks not found');
    }

    const responses = await runWithConcurrency(
      whs,
      async (wh) => {
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
      },
      webhookTestConcurrency()
    );

    return responses;
  };

export const testWebhook: MutationResolvers<AppContext>['testWebhook'] = async (
  _,
  { id },
  { db, user }
) => {
  const { competition } = await requireCompetitionAccess({
    db,
    user,
    webhookId: id,
  });

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
    await requireCompetitionAccess({ db, user, competitionId });
    const url = assertValidWebhookUrl(webhook.url);

    const res = await webhookFetch(
      {
        id: 0,
        competitionId,
        url,
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
