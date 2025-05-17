import prisma from '../db';

export const getCompetitorSubscriptions = async (
  userId: number,
  verified?: boolean
) =>
  prisma.competitorSubscription.findMany({
    where: {
      userId,
      ...(verified && { verified }),
    },
  });
