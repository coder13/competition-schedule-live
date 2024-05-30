import { Schedule } from '@wca/helpers';
import prisma from '../db';

export const getFlatActivities = (schedule: Schedule) => {
  const rooms = schedule.venues.map((venue) => venue.rooms).flat();
  const roundActivities = rooms.flatMap((room) => room.activities);
  const allFlatActivities = roundActivities.flatMap((activity) =>
    activity.childActivities?.length ? activity.childActivities : activity
  );
  return allFlatActivities;
};

export const fetchCompWithNoScheduledActivities = (competitionId: string) =>
  prisma.competition.findFirst({
    where: {
      id: competitionId,
    },
    include: {
      activityHistory: {
        where: {
          startTime: {
            not: null,
          },
          scheduledEndTime: null,
          scheduledStartTime: null,
        },
      },
    },
  });
