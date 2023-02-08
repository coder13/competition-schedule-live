import fetch from 'node-fetch';
import prisma from '../db';
import { Header } from '../generated/graphql';
import { Webhook } from '../prisma/generated/client';

export const webhookFetch = async (
  webhook: Webhook,
  data: Record<string, unknown>
) => {
  const headers = (webhook.headers as Header[]).reduce(
    (acc, h) => ({ ...acc, [h.key]: h.value }),
    {}
  );
  return fetch(webhook.url, {
    method: webhook.method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
};

export const sendWebhook = async (
  webhook: Webhook,
  data: Record<string, unknown>
) => {
  const response = await webhookFetch(webhook, data);

  if (!response.ok) {
    throw new Error(
      `Webhook failed with status code ${response.status} and message ${
        response.statusText
      }: ${await response.text()}`
    );
  }

  return response;
};

export const sendWebhooksForCompetition = async (
  competitionId: string,
  data: Record<string, unknown>
) => {
  const webhooks = await prisma.webhook.findMany({
    where: {
      competitionId: {
        equals: competitionId,
        mode: 'insensitive',
      },
    },
  });

  return Promise.allSettled(webhooks.map(async (w) => sendWebhook(w, data)));
};
