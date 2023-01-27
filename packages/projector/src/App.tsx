import { useQuery } from '@apollo/client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Competition as WCIF } from '@wca/helpers';
import { Activity, Competition } from './generated/graphql';
import {
  ActivitiesQuery,
  ActivitiesSubscription,
  GetCompetitionsQuery,
} from './graphql';

function CompetitionPage({ competitionId }: { competitionId: string }) {
  const [wcif, setWcif] = useState<WCIF | undefined>();

  const { data: activities, subscribeToMore } = useQuery<{
    activities: Activity[];
  }>(ActivitiesQuery, {
    variables: { competitionId: wcif?.id },
  });

  useEffect(() => {
    if (!wcif?.id) {
      return;
    }

    console.log('subscribing to more');

    const unsub = subscribeToMore<{ activity: Activity }>({
      document: ActivitiesSubscription,
      variables: { competitionIds: [wcif?.id] },
      updateQuery: (prev, { subscriptionData }) => {
        console.log(prev, subscriptionData);
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
  }, [wcif]);

  const currentActivities = activities?.activities.filter(
    (a) => a.startTime && !a.endTime
  );

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_WCA_API_ORIGIN ?? ''
      }/api/v0/competitions/${competitionId}/wcif/public`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw await res.text();
        }
        return res.json();
      })
      .then((wcif) => setWcif(wcif));
  }, []);

  const rooms = useMemo(() => {
    if (!wcif) return;
    return wcif?.schedule?.venues.map((venue) => venue.rooms).flat();
  }, [wcif]);

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

  const getRoomByActivity = useCallback(
    (activityId: number) => {
      return rooms?.find((room) =>
        room.activities.some(
          (a) =>
            a.id === activityId ||
            a?.childActivities?.some((a) => a.id === activityId)
        )
      );
    },
    [rooms]
  );

  const getActivityDataForId = useCallback(
    (activityId: number) => {
      return allActivities?.find((a) => a.id === activityId);
    },
    [allActivities]
  );

  const liveActivitiesWithRoom = useMemo(() => {
    return currentActivities?.map((activity) => ({
      ...activity,
      activity: getActivityDataForId(activity.activityId),
      room: getRoomByActivity(activity.activityId),
    }));
  }, [currentActivities, getActivityDataForId, getRoomByActivity]);

  console.log(liveActivitiesWithRoom);

  return (
    <div>
      <h1>{wcif?.name}</h1>
      {wcif?.schedule?.venues?.map((venue) => (
        <div>
          {venue.rooms.map((room) => (
            <div>
              <>
                <h2>{room.name}</h2>
                {liveActivitiesWithRoom
                  ?.filter((a) => a.room?.id === room.id)
                  .map((a) => {
                    return (
                      <div>
                        <h3>{a.activity?.name}</h3>
                        <p>
                          Started at{' '}
                          {a.activity?.startTime &&
                            new Date(
                              a.activity?.startTime
                            ).toLocaleTimeString()}
                        </p>
                      </div>
                    );
                  })}
              </>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [competitionId, setCompetitionId] = useState('');

  const { data: competitions } = useQuery<{ competitions: Competition[] }>(
    GetCompetitionsQuery
  );

  return (
    <div className="App">
      <ul style={{ display: 'flex', flexDirection: 'column' }}>
        {!competitionId
          ? competitions?.competitions.map((competition) => (
              <li>
                <a href="#" onClick={() => setCompetitionId(competition.id)}>
                  {competition.name}
                </a>
              </li>
            ))
          : null}
      </ul>
      {(competitionId && <CompetitionPage competitionId={competitionId} />) ||
        null}
    </div>
  );
}

export default App;
