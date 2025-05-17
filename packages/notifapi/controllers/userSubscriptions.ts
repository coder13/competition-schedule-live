import prisma from '../db';

export const getUserCompetitionSubscriptions = async (userId: number) =>
  prisma.competitionSubscription.findMany({
    where: {
      userId,
    },
  });
