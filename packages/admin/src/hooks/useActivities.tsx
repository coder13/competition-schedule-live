import { useQuery as useApolloQuery } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import { Schedule } from '@wca/helpers';
import { useEffect, useMemo } from 'react';
import { Activity } from '../generated/graphql';
import { ActivitiesQuery, ActivitiesSubscription } from '../graphql';

function useActivities(competitionId?: string) {
  const { data, subscribeToMore } = useApolloQuery<{
    activities: Activity[];
  }>(ActivitiesQuery, {
    variables: { competitionId },
  });

  const { data: schedule } = useQuery<Schedule>({
    queryKey: ['Schedule', competitionId],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_WCA_API_ORIGIN
        }/api/v0/competitions/${competitionId}/schedule`
      ).then((res) => res.json());
      return res;
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const unsub = subscribeToMore<{ activity: Activity }>({
      document: ActivitiesSubscription,
      variables: { competitionIds: [competitionId] },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData?.data?.activity) {
          return prev;
        }

        const newActivity = subscriptionData.data.activity;

        return {
          ...prev,
          activities: [
            ...prev.activities.filter(
              (a) => a.activityId !== newActivity.activityId
            ),
            newActivity,
          ],
        };
      },
    });

    return () => unsub();
  }, [data]);

  const rooms = useMemo(() => {
    if (!schedule) return;
    return schedule?.venues.map((venue) => venue.rooms).flat();
  }, [schedule]);

  const allActivities = useMemo(() => {
    if (!rooms) return;
    const roomActivities = rooms?.map((room) => room.activities).flat();
    return roomActivities
      ?.map((activity) =>
        activity.childActivities
          ? [...activity.childActivities, activity]
          : activity
      )
      ?.flat();
  }, [rooms]);

  return {
    activities: data?.activities ?? [],
    schedule,
    venues: schedule?.venues,
    rooms,
    allActivities,
  };
}

export default useActivities;
