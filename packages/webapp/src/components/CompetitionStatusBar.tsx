import { useMutation } from '@apollo/client';
import {
  Button,
  ButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useConfirm } from 'material-ui-confirm';
import pluralize from 'pluralize';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity } from '../generated/graphql';
import {
  ActivitiesQuery,
  StartActivitiesMutation,
  StopActivitiesMutation,
  StopStartActivitiesMutation,
} from '../graphql';
import useNow from '../hooks/useNow';
import {
  filterBetterActivityCode,
  mapToBetterActivityCode,
} from '../lib/activities';
import { durationToMinutes } from '../lib/time';
import { useCompetition } from '../pages/Competition/Layout';
import { ActivityCodeDataObject } from '../types';

interface CompetitionStatusBarProps {}

export function CompetitionStatusBar({}: CompetitionStatusBarProps) {
  const confirm = useConfirm();
  const location = useLocation();
  const { wcif, activities, rooms, ongoingActivities, getRoomForActivity } =
    useCompetition();
  const time = useNow();

  const [startActivities] = useMutation<Activity>(StartActivitiesMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Started Activity!', data);
    },
    onError: (error) => {
      console.log('Error starting activity', error);
    },
  });

  const [stopActivities] = useMutation<Activity[]>(StopActivitiesMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Stopped Activity!', data);
    },
    onError: (error) => {
      console.log('Error stopping activity', error);
    },
  });

  const [stopAndStartActivities] = useMutation<{
    stop: Activity[];
    start: Activity[];
  }>(StopStartActivitiesMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Stopped Activity!', data.stop);
      console.log('Started Activity!', data.start);
    },
    onError: (error) => {
      console.log('Error advancing activities', error);
    },
  });

  const allChildActivities = rooms
    ?.flatMap((room) => room.activities)
    .flatMap((activity) =>
      activity?.childActivities?.length ? activity.childActivities : activity
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const childActivitiesForActivityCode = (activityCode: string) =>
    allChildActivities?.filter(filterBetterActivityCode(activityCode));

  const uniqueActivityCodes = useMemo(
    () => [...new Set(allChildActivities?.map(mapToBetterActivityCode))],
    [allChildActivities]
  );

  const activitiesByActivityCodeMap = useMemo(() => {
    const activitiesByActivityCode: Record<string, ActivityCodeDataObject> = {};

    if (!allChildActivities) {
      return activitiesByActivityCode;
    }

    uniqueActivityCodes?.forEach((activityCode) => {
      const childActivities = childActivitiesForActivityCode(activityCode);
      if (!childActivities || !childActivities.length) {
        throw new Error(
          'No child activities found for activity code ' + activityCode
        );
      }

      const betterCode = mapToBetterActivityCode(childActivities[0]);
      const liveActivities = activities?.filter((a) =>
        childActivities?.some((activity) => a.activityId === activity.id)
      );

      activitiesByActivityCode[betterCode] = {
        activityCode,
        scheduledActivities: childActivities || [],
        liveActivities: liveActivities || [],
        name: childActivities[0].name || '',
        startTime: childActivities[0].startTime,

        scheduledStartTime:
          liveActivities?.find((i) => i.scheduledStartTime)
            ?.scheduledStartTime || null,
        scheduledEndTime:
          liveActivities?.find((i) => i.scheduledEndTime)?.scheduledEndTime ||
          null,
      };
    });
    return activitiesByActivityCode;
  }, [activities, uniqueActivityCodes]);

  const nextActivities = useMemo(
    () =>
      uniqueActivityCodes
        // filters to only activities that have not started yet
        ?.filter((activityCode) => {
          const { liveActivities } = activitiesByActivityCodeMap[activityCode];

          const noActivitiesHaveStarted = !liveActivities?.some(
            (a) => a.startTime
          );

          return !liveActivities || noActivitiesHaveStarted;
        })
        .map((activityCode) => activitiesByActivityCodeMap[activityCode]),
    [allChildActivities, activities]
  );

  const nextActivity = useMemo(() => {
    return nextActivities?.[0];
  }, [nextActivities]);

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

  const advanceToNextActivities = useCallback(async () => {
    // figure out what activities are currently going on
    if (!Object.keys(ongoingActivitiesByCode) || !nextActivity) {
      return;
    }

    const starting = nextActivity.scheduledActivities?.filter((a) => {
      const liveActivity = activities?.find((la) => la.activityId === a.id);
      return !liveActivity?.startTime || !liveActivity?.endTime;
    });

    await confirm({
      content: (
        <p>
          This would stop activities:
          <List dense>
            {ongoingActivities?.map((activity) => {
              const activityData = allChildActivities?.find(
                (ca) => ca.id === activity.activityId
              );

              if (!activityData) {
                return null;
              }
              const room = getRoomForActivity(activityData);

              return (
                <ListItem>
                  <ListItemText
                    primary={activityData?.name}
                    secondary={room?.name ?? '???'}
                  />
                </ListItem>
              );
            })}
          </List>
          <br /> and start activities: <br />
          <List dense>
            {starting?.map((activityData) => {
              if (!activityData) {
                return null;
              }

              const room = getRoomForActivity(activityData);

              return (
                <ListItem>
                  <ListItemText
                    primary={activityData.name}
                    secondary={room?.name ?? '???'}
                  />
                </ListItem>
              );
            })}
          </List>
        </p>
      ),
      confirmationText: 'Advance',
    });

    stopAndStartActivities({
      variables: {
        competitionId: wcif?.id,
        stopActivityIds: ongoingActivities?.map((a) => a.activityId),
        startActivityIds: starting.map((a) => a.id),
      },
    });
  }, [wcif, nextActivity, ongoingActivities]);

  const startOrStopActivities = async ({
    activityCode,
    scheduledActivities,
    liveActivities,
    name,
  }: ActivityCodeDataObject) => {
    console.log('startStopActivity', activityCode);
    // filter out activities that have already started or stopped

    const roomsForActivities = scheduledActivities.map((a) =>
      getRoomForActivity(a)
    );

    const isCurrent = scheduledActivities.every(
      (a) => liveActivities.find((la) => la.activityId === a.id)?.startTime
    );

    if (isCurrent) {
      await confirm({
        content: (
          <p>
            This will stop activities: <b>{name}</b> in rooms:{' '}
            {roomsForActivities.map((r) => r?.name).join(', ')}
          </p>
        ),
        confirmationText: 'Stop',
      });
      stopActivities({
        variables: {
          competitionId: wcif?.id,
          activityIds: scheduledActivities?.map((a) => a.id),
        },
      });
    } else {
      await confirm({
        content: (
          <p>
            This will start activity: <b>{name}</b> in rooms:{' '}
            {roomsForActivities.map((r) => r?.name).join(', ')}
          </p>
        ),
        confirmationText: 'Start',
      });

      startActivities({
        variables: {
          competitionId: wcif?.id,
          activityIds: scheduledActivities?.map((a) => a.id),
        },
      });
    }
  };

  const stopongoingActivities = useCallback(async () => {
    if (!ongoingActivities) {
      return;
    }

    await confirm({
      content: (
        <div>
          This would stop activities:
          <List dense>
            {ongoingActivities?.map((activity) => {
              const activityData = allChildActivities?.find(
                (ca) => ca.id === activity.activityId
              );

              if (!activityData) {
                return null;
              }
              const room = getRoomForActivity(activityData);

              return (
                <ListItem>
                  <ListItemText
                    primary={activityData?.name}
                    secondary={room?.name ?? '???'}
                  />
                </ListItem>
              );
            })}
          </List>
        </div>
      ),
      confirmationText: 'Stop',
    });

    stopActivities({
      variables: {
        competitionId: wcif?.id,
        activityIds: ongoingActivities.map((a) => a.activityId),
      },
    });
  }, [ongoingActivities, stopActivities, wcif?.id]);

  const minutesTillNextActivity: number = useMemo(() => {
    if (!nextActivity) {
      return 0;
    }

    const startTime = nextActivity.scheduledStartTime || nextActivity.startTime;

    return Math.round(
      (new Date(startTime).getTime() - time.getTime()) / 1000 / 60
    );
  }, [nextActivity, time]);

  if (
    location.pathname.includes('rooms') &&
    !location.pathname.includes('all')
  ) {
    return null;
  }

  return (
    <Paper
      elevation={7}
      style={{
        position: 'sticky',
        width: '100%',
        left: 0,
        bottom: 0,
      }}>
      <div
        style={{
          padding: '0.5em',
          transition: 'background-color 5s',
          backgroundColor: 'white',
        }}>
        <Typography variant="h6">
          Current {pluralize('Activity', ongoingActivities?.length)}
        </Typography>
        {ongoingActivities?.length === 0 ? (
          <b>None</b>
        ) : (
          <List dense>
            {Object.keys(ongoingActivitiesByCode || {} || {}).map(
              (activityCode) => {
                const liveActivities = ongoingActivitiesByCode[activityCode];
                const { scheduledActivities, name, scheduledEndTime } =
                  activitiesByActivityCodeMap[activityCode];

                const startTime = new Date(liveActivities[0].startTime);

                const duration = formatDuration(
                  intervalToDuration({
                    start: startTime,
                    end: time,
                  })
                );

                const endTime =
                  scheduledEndTime || scheduledActivities[0].endTime;

                return (
                  <ListItemButton
                    key={activityCode}
                    onClick={() =>
                      startOrStopActivities(
                        activitiesByActivityCodeMap[
                          activityCode
                        ] as ActivityCodeDataObject
                      )
                    }>
                    <ListItemText
                      primary={name}
                      secondary={
                        <>
                          Duration: {duration}
                          {endTime ? (
                            <>
                              <br />
                              {scheduledEndTime
                                ? 'Will stop'
                                : 'Should end'}{' '}
                              in:{' '}
                              {formatDuration({
                                minutes: durationToMinutes(
                                  time,
                                  new Date(endTime)
                                ),
                              })}
                            </>
                          ) : null}
                        </>
                      }
                    />
                  </ListItemButton>
                );
              }
            )}
          </List>
        )}

        <Divider sx={{ my: 1 }} />
        {nextActivity ? (
          <Typography>
            Next Activity: <b>{nextActivity.name}</b>{' '}
            {nextActivity.scheduledStartTime
              ? 'queued and starting'
              : 'scheduled to start'}{' '}
            <b>
              {minutesTillNextActivity === 0 && 'now'}
              {minutesTillNextActivity > 0 &&
                `in ${formatDuration(
                  {
                    ...(minutesTillNextActivity > 60 && {
                      hours: Math.floor(minutesTillNextActivity / 60),
                    }),
                    minutes: Math.floor(minutesTillNextActivity % 60),
                    ...(minutesTillNextActivity < 1 && {
                      seconds: Math.floor(minutesTillNextActivity * 60),
                    }),
                  },
                  {
                    format: ['days', 'hours', 'minutes', 'seconds'],
                  }
                )}`}
              {minutesTillNextActivity < 0 &&
                `${formatDuration(
                  {
                    ...(Math.abs(minutesTillNextActivity) > 60 && {
                      hours: Math.floor(Math.abs(minutesTillNextActivity) / 60),
                    }),
                    minutes: Math.floor(Math.abs(minutesTillNextActivity) % 60),
                  },
                  {
                    format: ['days', 'hours', 'minutes', 'seconds'],
                  }
                )} ago`}
            </b>
          </Typography>
        ) : (
          <Typography>No more upcoming activities!</Typography>
        )}
      </div>
      <Divider />
      <ButtonGroup fullWidth>
        {ongoingActivities?.length && nextActivity ? (
          <Button
            variant="contained"
            onClick={advanceToNextActivities}
            disabled={!ongoingActivities?.length || !nextActivity}>
            Advance to Next Activity
          </Button>
        ) : null}
        {!ongoingActivities?.length && nextActivity ? (
          <Button
            variant="contained"
            onClick={() => startOrStopActivities(nextActivity)}>
            Start Next Activity
          </Button>
        ) : null}

        <Button
          fullWidth
          variant="contained"
          onClick={stopongoingActivities}
          disabled={!ongoingActivities?.length}>
          Stop Current {pluralize('activity', allChildActivities?.length || 0)}
        </Button>
      </ButtonGroup>
    </Paper>
  );
}
