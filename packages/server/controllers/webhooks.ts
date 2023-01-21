import fetch from 'node-fetch';
import prisma from '../db';
import { Header, Webhook } from '../prisma/generated/client';

export const createNotificationsForActivity = async (
  competitionId: string,
  activityId: number
) => {
  return {
    competitionId,
    notifications: [
      {
        type: 'activity',
        id: activityId,
      },
    ],
  };
};

export const sendWebhook = async (
  webhook: Webhook & { Header: Header[] },
  data: Record<string, unknown>
) => {
  const response = await fetch(webhook.url, {
    method: webhook.method,
    headers: {
      'Content-Type': 'application/json',
      ...webhook.Header.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Webhook failed with status code ${response.status} and message ${response.statusText}`
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
      competitionId,
    },
    include: {
      Header: true,
    },
  });

  return Promise.allSettled(webhooks.map(async (w) => sendWebhook(w, data)));
};
