import prisma from '../db';
import { Prisma, PushDeliveryStatus } from '../prisma/generated/client';

const DEFAULT_PENDING_TIMEOUT_MS = 15 * 60 * 1000;

export interface PushDeliveryClaimInput {
  pushSubscriptionId: number;
  competitionId: string;
  wcaUserId: number;
  dedupeKey: string;
}

export type PushDeliveryClaim =
  | {
      status: 'claimed';
      deliveryId: number;
    }
  | {
      status: 'already-sent';
    }
  | {
      status: 'in-flight';
    };

export interface PushDeliveryResult {
  success: boolean;
  error?: unknown;
}

const pendingTimeoutMs = () => {
  const value = Number(process.env.PUSH_DELIVERY_PENDING_TIMEOUT_MS);
  return Number.isInteger(value) && value > 0
    ? value
    : DEFAULT_PENDING_TIMEOUT_MS;
};

const stalePendingCutoff = () => new Date(Date.now() - pendingTimeoutMs());

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

export const claimPushDelivery = async (
  input: PushDeliveryClaimInput,
  retryOnCreateRace = true
): Promise<PushDeliveryClaim> => {
  const existingDelivery = await prisma.pushDelivery.findFirst({
    where: {
      pushSubscriptionId: input.pushSubscriptionId,
      dedupeKey: input.dedupeKey,
    },
  });

  if (existingDelivery?.status === PushDeliveryStatus.sent) {
    return { status: 'already-sent' };
  }

  if (existingDelivery) {
    const result = await prisma.pushDelivery.updateMany({
      where: {
        id: existingDelivery.id,
        OR: [
          {
            status: {
              in: [PushDeliveryStatus.failed, PushDeliveryStatus.skipped],
            },
          },
          {
            status: PushDeliveryStatus.pending,
            updatedAt: {
              lte: stalePendingCutoff(),
            },
          },
        ],
      },
      data: {
        status: PushDeliveryStatus.pending,
        error: Prisma.JsonNull,
      },
    });

    return result.count === 1
      ? { status: 'claimed', deliveryId: existingDelivery.id }
      : { status: 'in-flight' };
  }

  try {
    const delivery = await prisma.pushDelivery.create({
      data: {
        pushSubscriptionId: input.pushSubscriptionId,
        competitionId: input.competitionId,
        wcaUserId: input.wcaUserId,
        dedupeKey: input.dedupeKey,
        status: PushDeliveryStatus.pending,
      },
    });

    return { status: 'claimed', deliveryId: delivery.id };
  } catch (error) {
    if (retryOnCreateRace && isUniqueConstraintError(error)) {
      return claimPushDelivery(input, false);
    }

    throw error;
  }
};

export const completePushDelivery = async (
  deliveryId: number,
  result: PushDeliveryResult
) =>
  prisma.pushDelivery.update({
    where: {
      id: deliveryId,
    },
    data: {
      status: result.success
        ? PushDeliveryStatus.sent
        : PushDeliveryStatus.failed,
      error:
        result.error === null || result.error === undefined
          ? Prisma.JsonNull
          : (result.error as Prisma.InputJsonValue),
    },
  });
