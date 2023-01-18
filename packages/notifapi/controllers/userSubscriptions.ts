import prisma from '../db';

export const getUserCompetitionSubscriptions = (userId: number) =>
  prisma.competitionSubscription.findMany({
    where: {
      userId,
    },
  });
