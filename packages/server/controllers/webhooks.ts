import prisma from '../db';
import { Header } from '../generated/graphql';
import { Webhook } from '../prisma/generated/client';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';
import { assertWebhookUrlResolvesPublicly } from '../lib/webhookUrls';
import { settleWithConcurrency } from '../lib/runWithConcurrency';

const BODYLESS_METHODS = new Set(['GET', 'HEAD']);
const MAX_WEBHOOK_ERROR_BODY_LENGTH = 2048;
const MAX_WEBHOOK_RESPONSE_SIZE_BYTES = 64 * 1024;

const webhookConcurrency = () => {
  const value = Number(process.env.WEBHOOK_DELIVERY_CONCURRENCY);
  return Number.isInteger(value) && value > 0 ? value : 5;
};

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

export const webhookFetch = async (
  webhook: Webhook,
  data: Record<string, unknown>
) => {
  const webhookHeaders = Array.isArray(webhook.headers)
    ? (webhook.headers as Header[])
    : [];
  const headers = webhookHeaders.reduce(
    (acc, h) => ({ ...acc, [h.key]: h.value }),
    {}
  );
  const url = await assertWebhookUrlResolvesPublicly(webhook.url);
  const canSendBody = !BODYLESS_METHODS.has(webhook.method);

  return fetchWithTimeout(url, {
    method: webhook.method,
    size: MAX_WEBHOOK_RESPONSE_SIZE_BYTES,
    headers: {
      ...(canSendBody && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(canSendBody && { body: JSON.stringify(data) }),
  });
};

export const sendWebhook = async (
  webhook: Webhook,
  data: Record<string, unknown>
) => {
  const response = await webhookFetch(webhook, data);

  if (!response.ok) {
    const body = truncate(await response.text(), MAX_WEBHOOK_ERROR_BODY_LENGTH);

    throw new Error(
      `Webhook failed with status code ${response.status} and message ${response.statusText}: ${body}`
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

  return settleWithConcurrency(
    webhooks,
    async (webhook) => sendWebhook(webhook, data),
    webhookConcurrency()
  );
};
