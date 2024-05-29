import { Schedule } from '@wca/helpers';

export const getFlatActivities = (schedule: Schedule) => {
  const rooms = schedule.venues.map((venue) => venue.rooms).flat();
  const roundActivities = rooms.flatMap((room) => room.activities);
  const allFlatActivities = roundActivities.flatMap((activity) =>
    activity.childActivities?.length ? activity.childActivities : activity
  );
  return allFlatActivities;
};
