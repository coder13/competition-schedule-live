import { Competition } from '@wca/helpers';
import { useQuery } from '@tanstack/react-query';

function useWCIF(competitionId: string) {
  const { isLoading, data: wcif } = useQuery({
    queryKey: ['wcif'],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_WCA_API_ORIGIN
        }/api/v0/competitions/${competitionId}/wcif/public`
      );

      return res.json() as Promise<Competition>;
    },
  });

  const rooms = wcif?.schedule?.venues.map((venue) => venue.rooms).flat();

  const allActivities = rooms
    ?.flatMap((room) => room.activities)
    ?.flatMap((activity) =>
      activity.childActivities
        ? [...activity.childActivities, activity]
        : activity
    );

  const getActivitiesForActivityCode = (activityCode: string) =>
    allActivities?.filter((a) => a.activityCode === activityCode);

  const allUniqueActivityCodes = [
    ...new Set(allActivities?.map((a) => a.activityCode)),
  ];

  return {
    isLoading,
    wcif,
    rooms,
    allActivities,
    allUniqueActivityCodes,
    getActivitiesForActivityCode,
  };
}

export default useWCIF;
