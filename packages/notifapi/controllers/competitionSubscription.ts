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

export const getAllUserCompetitionSubscriptions = (
  competitionId: string,
  activityCodes: string[]
) => {
  const values = ['*', ...activityCodes];
  return prisma.competitionSubscription.findMany({
    select: {
      user: {
        select: {
          id: true,
          phoneNumber: true,
          CompetitionSubscription: {
            select: {
              type: true,
              value: true,
            },
            where: {
              competitionId: competitionId.toLowerCase(),
              type: CompetitionSubscriptionType.activity,
              value: {
                in: values,
              },
            },
          },
        },
      },
    },
    where: {
      competitionId: competitionId.toLowerCase(),
      type: CompetitionSubscriptionType.activity,
      value: {
        in: values,
      },
    },
  });
};

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

/**
 * Performs a transaction to add competition subscriptions and then does a find to attempt to return the added subscriptions
 * @param userId
 * @param competitionId
 * @param subscriptions
 * @returns
 */
export const addCompetitionSubscriptions = async (
  userId: number,
  competitionId: string,
  subscriptions: [
    {
      type: CompetitionSubscriptionType;
      value: string;
    }
  ]
) => {
  const allSubs = await prisma.$transaction([
    prisma.competitionSubscription.createMany({
      data: subscriptions.map((subscription) => ({
        userId,
        competitionId: competitionId.toLowerCase(),
        type: subscription.type,
        value: subscription.value,
      })),
    }),
    prisma.competitionSubscription.findMany({
      where: {
        userId,
        competitionId: competitionId.toLowerCase(),
      },
    }),
  ]);

  return allSubs[1].filter((s) =>
    subscriptions.some((sub) => sub.value === s.value && sub.type === s.type)
  );
};

export const addCompetitionSubscription = async (
  userId: number,
  competitionId: string,
  type: CompetitionSubscriptionType,
  value: string
) =>
  prisma.competitionSubscription.create({
    data: {
      userId,
      competitionId: competitionId.toLowerCase(),
      type,
      value,
    },
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
        competitionId: competitionId.toLowerCase(),
      },
    }),
    prisma.competitionSubscription.createMany({
      data: newSubscriptions.map((subscription) => ({
        userId,
        competitionId: competitionId.toLowerCase(),
        type: subscription.type,
        value: subscription.value,
      })),
    }),
    prisma.competitionSubscription.findMany({
      where: {
        userId,
        competitionId: competitionId.toLowerCase(),
      },
    }),
  ]);
