import { useQuery } from '@apollo/client';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import WCA, { activityCodeToName, parseActivityCode, Room } from '@wca/helpers';
import { Activity, Competition } from './generated/graphql';
import {
  ActivitiesQuery,
  ActivitiesSubscription,
  GetCompetitionsQuery,
} from './graphql';

interface ActivityCodeDataObject {
  activityCode: string;
  scheduledActivities: WCA.Activity[];
  liveActivities: Activity[];
  name: string;
  startTime: string;
}

const mapToBetterActivityCode = ({
  name,
  activityCode,
}: {
  name: string;
  activityCode: string;
}) => {
  if (activityCode === 'other-misc') {
    return `other-misc-${name.toLowerCase().replace(' ', '-')}`;
  }
  return activityCode;
};

const filterBetterActivityCode =
  (activityCode: string) => (a: { activityCode: string; name: string }) => {
    if (activityCode.startsWith('other-misc-')) {
      return (
        a.activityCode === 'other-misc' &&
        a.name.toLowerCase().replace(' ', '-') ===
          activityCode.replace('other-misc-', '')
      );
    }
    return a.activityCode === activityCode;
  };

function CompetitionPage({ competitionId }: { competitionId: string }) {
  const { data: wcif } = useReactQuery<WCA.Competition>({
    queryKey: ['wcif', competitionId],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_WCA_API_ORIGIN ?? ''
        }/api/v0/competitions/${competitionId}/wcif/public`
      );

      if (!res.ok) {
        throw await res.text();
      }

      return res.json();
    },
    refetchInterval: 1000 * 60 * 15,
  });

  const { data: activities, subscribeToMore } = useQuery<{
    activities: Activity[];
  }>(ActivitiesQuery, {
    variables: { competitionId: wcif?.id },
  });

  const ongoingActivities = activities?.activities.filter(
    (a) => a.startTime && !a.endTime
  ) as (Activity & { startTime: string })[];

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

  const rooms = useMemo(() => {
    if (!wcif) return;
    return wcif?.schedule?.venues.map((venue) => venue.rooms).flat();
  }, [wcif]);

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

  const allChildActivities = rooms
    ?.flatMap((room) => room.activities)
    .flatMap((activity) =>
      activity?.childActivities?.length ? activity.childActivities : activity
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const uniqueActivityCodes = useMemo(
    () => [...new Set(allChildActivities?.map(mapToBetterActivityCode))],
    [allChildActivities]
  );

  const childActivitiesForActivityCode = (activityCode: string) =>
    allChildActivities?.filter(filterBetterActivityCode(activityCode));

  const activitiesByActivityCodeMap = useMemo(() => {
    const activitiesByActivityCode: Record<string, ActivityCodeDataObject> = {};

    if (!activities) {
      return {};
    }

    uniqueActivityCodes?.forEach((activityCode) => {
      const childActivities = childActivitiesForActivityCode(activityCode);
      if (!childActivities) {
        return;
      }

      const betterCode = mapToBetterActivityCode(childActivities[0]);
      const liveActivities = activities?.activities?.filter((a) =>
        childActivities?.some((activity) => a.activityId === activity.id)
      );

      if (!childActivities || !childActivities.length) {
        throw new Error(
          'No child activities found for activity code ' + activityCode
        );
      }

      activitiesByActivityCode[betterCode] = {
        activityCode,
        scheduledActivities: childActivities || [],
        liveActivities: liveActivities || [],
        name: childActivities[0].name || '',
        startTime: childActivities[0].startTime,
      };
    });
    return activitiesByActivityCode;
  }, [activities, uniqueActivityCodes]);

  const nextActivities = useMemo(
    () =>
      activities && activitiesByActivityCodeMap
        ? uniqueActivityCodes
            // filters to only activities that have not started yet
            ?.filter((activityCode) => {
              const { liveActivities } =
                activitiesByActivityCodeMap[activityCode];

              const noActivitiesHaveStarted = !liveActivities?.some(
                (a) => a.startTime
              );

              return !liveActivities || noActivitiesHaveStarted;
            })
            .map((activityCode) => activitiesByActivityCodeMap[activityCode])
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
        : [],
    [allChildActivities, activities]
  );
  const nextActivity = nextActivities?.[0];

  const ongoingActivitiesByCode = useMemo(() => {
    if (!ongoingActivities) {
      return {};
    }

    return ongoingActivities.reduce<
      Record<string, (Activity & { startTime: string })[]>
    >((acc, activity) => {
      const a = allChildActivities?.find((ca) => ca.id === activity.activityId);
      if (!a) {
        return acc;
      }

      const betterCode = mapToBetterActivityCode(a);

      return {
        ...acc,
        [betterCode]: [...(acc[betterCode] || []), activity],
      };
    }, {});
  }, [ongoingActivities, allChildActivities]);

  return (
    <div className="flex flex-col">
      <div className="flex w-full divide-x p-1">
        {Object.keys(ongoingActivitiesByCode).map((activityCode) => {
          const scheduledActivities = childActivitiesForActivityCode(
            activityCode
          ) as WCA.Activity[];

          const rooms = scheduledActivities
            .map((a) => getRoomByActivity(a.id))
            .filter(Boolean) as Room[];

          if (activityCode.startsWith('other')) {
            return (
              <div className="flex flex-1 flex-col items-center">
                <div className="text-2xl flex space-x-2 p-1">
                  <span className="text-left">
                    {scheduledActivities?.[0].name}
                  </span>
                </div>
                <div className="p-1 flex space-x-2">
                  {rooms.map((room, index) => (
                    <>
                      {index > 0 && ', '}
                      <span>{room.name}</span>
                    </>
                  ))}
                </div>
              </div>
            );
          }
          const { eventId, roundNumber, groupNumber, attemptNumber } =
            parseActivityCode(activityCode);

          return (
            <div className="flex flex-1 flex-col items-center">
              <div className="p-1 flex space-x-2">
                {rooms.map((room, index) => (
                  <>
                    {index > 0 && ', '}
                    <span>{room.name}</span>
                  </>
                ))}
              </div>
              <div className="text-2xl flex space-x-2 p-1">
                <span className="text-left">{activityCodeToName(eventId)}</span>
                <span>{'—'}</span>
                <span className="text-left">Round {roundNumber}</span>
                <span>{'—'}</span>
                <span className="text-left">
                  Group {groupNumber}{' '}
                  {attemptNumber ? `(Attempt ${attemptNumber})` : ''}
                </span>
              </div>
            </div>
          );
        })}
        <div className="flex flex-col items-center px-4">
          <span className="text-left">Next</span>
          {nextActivity && (
            <div className="flex flex-col">
              <div className="text-lg flex space-x-2 p-1">
                <span className="text-left">{nextActivity.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { data: competitions } = useQuery<{ competitions: Competition[] }>(
    GetCompetitionsQuery
  );

  const pathname = window.location.pathname.replace('/', '');

  return (
    <div className="flex flex-col w-100">
      <ul style={{ display: 'flex', flexDirection: 'column' }}>
        {!pathname
          ? competitions?.competitions.map((competition) => (
              <li>
                <a href={competition.id}>{competition.name}</a>
              </li>
            ))
          : null}
      </ul>
      {(pathname && <CompetitionPage competitionId={pathname} />) || null}
    </div>
  );
}

export default App;
