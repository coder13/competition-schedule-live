import type { PrismaClient } from '../prisma/generated/client';
import { Status } from '../prisma/generated/client';
import { MOCK_COMPETITION_ID, MOCK_USER_ID } from './config';
import { getMockCompetition } from './wca';

export const seedMockCompetition = async (db: PrismaClient) => {
  const competition = getMockCompetition();
  const startDate = competition.schedule.startDate;

  await db.activityHistory.deleteMany({
    where: {
      competitionId: MOCK_COMPETITION_ID,
    },
  });

  await db.competition.upsert({
    where: {
      id: MOCK_COMPETITION_ID,
    },
    update: {
      name: competition.name,
      country: 'US',
      startDate,
      endDate: startDate,
      autoAdvance: true,
      autoAdvanceDelay: 0,
      status: Status.NOT_STARTED,
    },
    create: {
      id: MOCK_COMPETITION_ID,
      name: competition.name,
      country: 'US',
      startDate,
      endDate: startDate,
      autoAdvance: true,
      autoAdvanceDelay: 0,
      status: Status.NOT_STARTED,
      competitionAccess: {
        create: {
          userId: MOCK_USER_ID,
          roomId: 0,
        },
      },
    },
  });

  await db.competitionAccess.upsert({
    where: {
      competitionId_userId: {
        competitionId: MOCK_COMPETITION_ID,
        userId: MOCK_USER_ID,
      },
    },
    update: {
      roomId: 0,
    },
    create: {
      competitionId: MOCK_COMPETITION_ID,
      userId: MOCK_USER_ID,
      roomId: 0,
    },
  });
};
