import { Activity, Competition, Room } from '@wca/helpers';

export const rooms = (wcif: Competition) => {
  return wcif.schedule.venues.flatMap((v) => v.rooms);
};

export const allChildActivities = ({
  activities,
  childActivities,
}: {
  activities?: Activity[];
  childActivities?: Activity[];
}): Activity[] => {
  return (childActivities || activities || []).flatMap((a) => [
    a,
    ...(!!a.childActivities
      ? allChildActivities(a as { childActivities: Activity[] })
      : []),
  ]);
};
