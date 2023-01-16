import prisma from '../db';
import { CompetitionSubscriptionType } from '../prisma/generated/client';

export const getCompetitionSubscriptions = (
  userId: number,
  type?: CompetitionSubscriptionType
) =>
  prisma.competitionSubscription.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
  });

export const getCompetitorSubscriptions = (
  userId: number,
  verified?: boolean
) =>
  prisma.competitorSubscription.findMany({
    where: {
      userId,
      ...(verified && { verified }),
    },
  });

export const addCompetitionSubscriptions = (
  userId: number,
  competitionId: string,
  subscriptions: [
    {
      type: CompetitionSubscriptionType;
      value: string;
    }
  ]
) =>
  prisma.competitionSubscription.createMany({
    data: subscriptions.map((subscription) => ({
      userId,
      competitionId,
      type: subscription.type,
      value: subscription.value,
    })),
  });

export const removeCompetitionSubscriptions = (subscriptionIds: number[]) =>
  prisma.competitionSubscription.deleteMany({
    where: {
      id: {
        in: subscriptionIds,
      },
    },
  });

export const replaceCompetitionSubscriptions = async (
  userId: number,
  competitionId: string,
  newSubscriptions: [
    {
      type: CompetitionSubscriptionType;
      value: string;
    }
  ]
) =>
  prisma.$transaction([
    prisma.competitionSubscription.deleteMany({
      where: {
        userId,
        competitionId,
      },
    }),
    prisma.competitionSubscription.createMany({
      data: newSubscriptions.map((subscription) => ({
        userId,
        competitionId,
        type: subscription.type,
        value: subscription.value,
      })),
    }),
    prisma.competitionSubscription.findMany({
      where: {
        userId,
        competitionId,
      },
    }),
  ]);
