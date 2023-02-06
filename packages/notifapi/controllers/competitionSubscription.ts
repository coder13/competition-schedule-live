import prisma from '../db';
import { CompetitionSubscriptionType } from '../prisma/generated/client';

export const getCompetitionSubscriptions = (
  competitionId: string,
  userId: number,
  type?: CompetitionSubscriptionType
) =>
  prisma.competitionSubscription.findMany({
    where: {
      competitionId: {
        equals: competitionId,
        mode: 'insensitive',
      },
      userId,
      ...(type && { type }),
    },
  });

export const getAllUserCompetitionSubscriptions = (
  competitionId: string,
  activityCodes: string[]
) => {
  const values = ['*', ...activityCodes];
  return prisma.user.findMany({
    include: {
      CompetitionSubscription: {
        where: {
          competitionId: {
            equals: competitionId,
            mode: 'insensitive',
          },
          value: {
            in: values,
          },
        },
      },
    },
    where: {
      CompetitionSubscription: {
        some: {
          competitionId: {
            equals: competitionId,
            mode: 'insensitive',
          },
          type: CompetitionSubscriptionType.activity,
          value: {
            in: values,
          },
        },
      },
    },
  });
};

export const getAllUserCompetitionCompetitorSubscriptions = (
  competitionId: string,
  wcaUserIds: number[]
) =>
  prisma.competitionSubscription.findMany({
    where: {
      competitionId: {
        equals: competitionId,
        mode: 'insensitive',
      },
      type: CompetitionSubscriptionType.competitor,
      value: {
        in: wcaUserIds.map((i) => i.toString()),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          phoneNumber: true,
        },
      },
    },
  });
// prisma.competitionSubscription.findMany({
//   select: {
//     user: {
//       select: {
//         id: true,
//         phoneNumber: true,
//         CompetitionSubscription: {
//           select: {
//             type: true,
//             value: true,
//           },
//           where: {
//             competitionId,
//             type: CompetitionSubscriptionType.competitor,
//             value: {
//               in: wcaUserIds.map((i) => i.toString()),
//             },
//           },
//         },
//       },
//     },
//   },
//   where: {
//     competitionId,
//     type: CompetitionSubscriptionType.competitor,
//     value: {
//       in: wcaUserIds.map((i) => i.toString()),
//     },
//   },
// });

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
        competitionId,
        type: subscription.type,
        value: subscription.value,
      })),
    }),
    prisma.competitionSubscription.findMany({
      where: {
        userId,
        competitionId: {
          equals: competitionId,
          mode: 'insensitive',
        },
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
      competitionId,
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
        competitionId: {
          equals: competitionId,
          mode: 'insensitive',
        },
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
        competitionId: {
          equals: competitionId,
          mode: 'insensitive',
        },
      },
    }),
  ]);
