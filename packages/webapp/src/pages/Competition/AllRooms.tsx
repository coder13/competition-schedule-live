import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Button,
  ButtonGroup,
  Container,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from '@mui/material';
import pluralize from 'pluralize';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import wCA from '@wca/helpers';
import { Activity } from '../../generated/graphql';
import {
  ActivitiesQuery,
  ResetActivityMutation,
  StartActivitiesMutation,
  StopActivityMutation,
  StopStartActivitiesMutation,
} from '../../graphql';
import { useCompetition } from './Layout';
import { useConfirm } from 'material-ui-confirm';

const durationToMinutes = (start: Date, end: Date): number =>
  Math.round((end.getTime() - start.getTime()) / 1000 / 60);

function CompetitionAllRooms() {
  const confirm = useConfirm();
  const {
    wcif,
    loading: loadingWcif,
    activities,
    ongoingActivities,
    activitiesLoading,
  } = useCompetition();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [startActivities] = useMutation<Activity>(StartActivitiesMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Started Activity!', data);
    },
    onError: (error) => {
      console.log('Error starting activity', error);
    },
  });

  const [stopActivity] = useMutation<Activity>(StopActivityMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Stopped Activity!', data);
    },
    onError: (error) => {
      console.log('Error stopping activity', error);
    },
  });

  const [resetActivity] = useMutation<Activity>(ResetActivityMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Reset Activity!', data);
    },
    onError: (error) => {
      console.log('Error resetting activity', error);
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

  const rooms = wcif?.schedule.venues.flatMap((venue) => venue.rooms);

  const allChildActivities = rooms
    ?.flatMap((room) => room.activities)
    .flatMap((activity) =>
      activity?.childActivities?.length ? activity.childActivities : activity
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const uniqueActivityCodes = useMemo(
    () => [
      ...new Set(
        allChildActivities?.map((a) => {
          if (a.activityCode === 'other-misc') {
            return `other-misc-${a.name.toLowerCase().replace(' ', '-')}`;
          }
          return a.activityCode;
        })
      ),
    ],
    [allChildActivities]
  );

  const activitiesByActivityCodeMap = useMemo(() => {
    const activitiesByActivityCode: Record<
      string,
      {
        scheduledActivities: wCA.Activity[];
        liveActivities: Activity[];
        name: string;
        startTime: string;
      }
    > = {};

    uniqueActivityCodes?.forEach((activityCode) => {
      const childActivities = childActivitiesForActivityCode(activityCode);
      const liveActivities = activities?.filter((a) =>
        childActivities?.some((activity) => a.activityId === activity.id)
      );

      if (!childActivities || !childActivities.length) {
        return;
      }

      activitiesByActivityCode[activityCode] = {
        scheduledActivities: childActivities || [],
        liveActivities: liveActivities || [],
        name: childActivities[0].name || '',
        startTime: childActivities[0].startTime,
      };
    });
    return activitiesByActivityCode;
  }, [activities, uniqueActivityCodes]);

  const childActivitiesForActivityCode = (activityCode: string) =>
    allChildActivities?.filter((a) => {
      if (activityCode.startsWith('other-misc-')) {
        return (
          a.activityCode === 'other-misc' &&
          a.name.toLowerCase().replace(' ', '-') ===
            activityCode.replace('other-misc-', '')
        );
      }
      return a.activityCode === activityCode;
    });

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

  const doneActivities = useMemo(
    () =>
      uniqueActivityCodes
        // filters to only activities that have not started yet
        ?.filter((activityCode) => {
          const { liveActivities } = activitiesByActivityCodeMap[activityCode];

          // if there are no live activities, then all activities have ended
          const allActivitiesHaveEnded = !liveActivities?.some(
            (a) => !a.startTime || !a.endTime
          );

          return allActivitiesHaveEnded;
        })
        .map((activityCode) => activitiesByActivityCodeMap[activityCode]),
    [nextActivities, allChildActivities]
  );

  const nextActivity = useMemo(() => {
    return nextActivities?.[0];
  }, [nextActivities]);

  const startOrStopActivities = async (activityCode: string) => {
    console.log('startStopActivity', activityCode);

    const { scheduledActivities, liveActivities } =
      activitiesByActivityCodeMap[activityCode];

    // filter out activities that have already started or stopped
    const startingActivities = scheduledActivities?.filter((a) => {
      const liveActivity = liveActivities?.find((la) => la.activityId === a.id);
      return !liveActivity?.startTime || !liveActivity?.endTime;
    });

    const roomsForStartingActivities = rooms?.filter((room) =>
      startingActivities?.some((a) =>
        room.activities.some(
          (ra) =>
            ra.id === a.id || ra?.childActivities?.some((ca) => ca.id === a.id)
        )
      )
    );

    const stopping = scheduledActivities?.filter((a) => {
      const liveActivity = liveActivities?.find((la) => la.activityId === a.id);
      return liveActivity?.startTime || !liveActivity?.endTime;
    });

    await confirm({
      content: (
        <>
          <p>
            This will start activities <b>{startingActivities?.[0]?.name}</b> in
            rooms{' '}
            <b>{roomsForStartingActivities?.map((r) => r.name).join(', ')}</b>
          </p>
          <p>
            This will stop activities <b>{stopping?.[0]?.name}</b> in rooms{' '}
            <b>{roomsForStartingActivities?.map((r) => r.name).join(', ')}</b>
          </p>
        </>
      ),
      confirmationText: 'Start',
    });
  };

  //   if (isCurrent) {
  //     await confirm({
  //       content: (
  //         <p>
  //           This will stop activities: <b>{childActivities?.[0]?.name}</b> in
  //           all rooms
  //         </p>
  //       ),
  //       confirmationText: 'Stop',
  //     });
  //     stopActivity({
  //       variables: {
  //         competitionId: wcif?.id,
  //         activityIds,
  //       },
  //     });
  //   } else {
  //     await confirm({
  //       content: (
  //         <p>
  //           This will stop activity: <b>{childActivities?.[0]?.name}</b> in all
  //           rooms
  //         </p>
  //       ),
  //       confirmationText: 'Start',
  //     });

  //     startActivities({
  //       variables: {
  //         competitionId: wcif?.id,
  //         activityIds,
  //       },
  //     });
  //   }
  // };

  const advanceToNextActivities = useCallback(async () => {
    if (ongoingActivities?.length && nextActivity) {
      const stopActivities = ongoingActivities?.flatMap((a) =>
        allChildActivities?.find((ca) => ca.id === a.activityId)
      );

      // const roomsForChildActivitiesToStart = rooms?.filter((room) =>
      //   room.activities.some(
      //     (activity) =>
      //       nextActivity.childActivities.some((ca) => ca.id === activity.id) ||
      //       activity?.childActivities?.some((ca) => ca.id === activity.id)
      //   )
      // );
      const starting = nextActivity.scheduledActivities?.filter((a) => {
        const liveActivity = activities?.find((la) => la.activityId === a.id);
        return !liveActivity?.startTime || !liveActivity?.endTime;
      });

      await confirm({
        content: (
          <p>
            This would stop activities:
            <List dense>
              {stopActivities?.map((activity) => (
                <ListItem>
                  <ListItemText primary={activity.name} />
                </ListItem>
              ))}
            </List>
            <br /> and start activities: <br />
            <List dense>
              {starting?.map((activity) => {
                <ListItem>
                  <ListItemText primary={activity.name} />
                </ListItem>;
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
          startActivityId: nextActivity.childActivities[0].id,
        },
      });
    }
  }, [wcif, nextActivity, ongoingActivities]);

  const stopongoingActivities = useCallback(async () => {
    await confirm({
      content: (
        <p>
          This would stop activities:
          <List dense>
            {ongoingActivities
              ?.map((a) =>
                allChildActivities?.find((ca) => ca.id === a.activityId)
              )
              .map((ca) => (
                <ListItem>
                  <ListItemText primary={ca?.name} />
                </ListItem>
              ))}
          </List>
        </p>
      ),
      confirmationText: 'Stop',
    });

    ongoingActivities?.forEach((activity) => {
      stopActivity({
        variables: {
          competitionId: wcif?.id,
          activityId: activity.activityId,
        },
      });
    });
  }, [ongoingActivities, stopActivity, wcif?.id]);

  const handleResetActivity = useCallback(
    async (activityId: number) => {
      const activityData = allChildActivities?.find((a) => a.id === activityId);

      await confirm({
        content: (
          <>
            <p>
              This will reset activity: <b>{activityData?.name}</b>
            </p>
            <p>
              The start and stop times will reset as if the activity never
              happened.
            </p>
          </>
        ),
        confirmationText: 'Reset',
      });

      resetActivity({
        variables: {
          competitionId: wcif?.id,
          activityId: activityId,
        },
      });
    },
    [wcif, allChildActivities]
  );

  const minutesTillNextActivity: number = useMemo(() => {
    if (!nextActivity) {
      return 0;
    }

    return Math.round(
      (new Date(nextActivity.childActivities[0].startTime).getTime() -
        time.getTime()) /
        1000 /
        60
    );
  }, [nextActivity, time]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
      <Container
        maxWidth="md"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: 0,
        }}>
        {loadingWcif || activitiesLoading ? <LinearProgress /> : null}
        <Typography variant="h4" sx={{ p: 1 }}>
          All Rooms
        </Typography>
        <Divider />
        <List dense>
          {nextActivities?.length ? (
            <>
              <ListSubheader disableSticky>Next</ListSubheader>
              {nextActivities?.map(
                ({ activityCode, childActivities, name }) => {
                  const liveActivities = activities?.find((a) =>
                    childActivities?.some((ca) => ca.id === a.activityId)
                  );

                  const startTimes = [
                    ...new Set(childActivities?.map((ca) => ca.startTime)),
                  ];

                  let secondaryText = '';

                  if (startTimes.length === 1) {
                    secondaryText = new Date(startTimes[0]).toLocaleString();
                  } else {
                    secondaryText = startTimes
                      .map((startTime) => new Date(startTime).toLocaleString())
                      .join(', ');
                  }

                  return (
                    <ListItemButton
                      onClick={() =>
                        startOrStopActivities(
                          childActivities?.map((ca) => ca.id)
                        )
                      }
                      key={activityCode}>
                      <ListItemText primary={name} secondary={secondaryText} />
                    </ListItemButton>
                  );
                }
              )}
            </>
          ) : null}
          {doneActivities?.length ? (
            <>
              <ListSubheader disableSticky>Done</ListSubheader>
              {doneActivities.map((activity) => {
                const liveActivity = activities?.find(
                  (a) => a.activityId === activity.id
                );
                let secondaryText: JSX.Element | string = '';

                if (!liveActivity) {
                  secondaryText = new Date(activity.startTime).toLocaleString();
                } else if (!!liveActivity?.startTime && !liveActivity.endTime) {
                  secondaryText = `Started ${formatDuration(
                    intervalToDuration({
                      start: new Date(liveActivity.startTime),
                      end: time,
                    })
                  )} ago`;
                } else if (
                  !!liveActivity?.startTime &&
                  !!liveActivity?.endTime
                ) {
                  const minutesLate = Math.round(
                    (new Date(activity.endTime).getTime() -
                      new Date(liveActivity.startTime).getTime()) /
                      1000 /
                      60
                  );
                  const activityDuration = Math.round(
                    (new Date(liveActivity.endTime).getTime() -
                      new Date(liveActivity.startTime).getTime()) /
                      1000
                  );
                  secondaryText = (
                    <>
                      Ended {formatDuration({ minutes: Math.abs(minutesLate) })}{' '}
                      {minutesLate < 0 ? 'late' : 'early'}
                      <br />
                      Ran for{' '}
                      {formatDuration({
                        ...(activityDuration < 60
                          ? {
                              seconds: activityDuration,
                            }
                          : {
                              minutes: Math.round(activityDuration / 60),
                            }),
                      })}
                    </>
                  );
                }

                return (
                  <ListItemButton
                    onClick={() => handleResetActivity(activity.id)}
                    key={activity.id}>
                    <ListItemText
                      primary={activity.name}
                      secondary={secondaryText}
                    />
                  </ListItemButton>
                );
              })}
            </>
          ) : null}
        </List>
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
                {ongoingActivities?.map((activity) => {
                  const wcifActivity = allChildActivities?.find(
                    (a) => a.id === activity.activityId
                  );
                  const duration = formatDuration(
                    intervalToDuration({
                      start: new Date(activity.startTime),
                      end: time,
                    })
                  );

                  return (
                    <ListItemButton
                      onClick={() => startStopActivity(activity.activityId)}
                      key={activity.activityId}>
                      <ListItemText
                        primary={
                          allChildActivities?.find(
                            (a) => a.id === activity.activityId
                          )?.name
                        }
                        secondary={
                          <>
                            Duration: {duration}
                            {wcifActivity ? (
                              <>
                                <br />
                                Ends in:{' '}
                                {formatDuration({
                                  minutes: durationToMinutes(
                                    time,
                                    new Date(wcifActivity.endTime)
                                  ),
                                })}
                              </>
                            ) : null}
                          </>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}

            <Divider sx={{ my: 1 }} />
            {nextActivity ? (
              <Typography>
                Next Activity: <b>{nextActivity.name}</b> scheduled to start{' '}
                <b>
                  {minutesTillNextActivity === 0
                    ? 'now'
                    : `in ${formatDuration(
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
                onClick={() => startStopActivity(nextActivity.id)}>
                Start Next Activity
              </Button>
            ) : null}

            <Button
              fullWidth
              variant="contained"
              onClick={stopongoingActivities}
              disabled={!ongoingActivities?.length}>
              Stop Current{' '}
              {pluralize('activity', allChildActivities?.length || 0)}
            </Button>
          </ButtonGroup>
        </Paper>
      </Container>
    </div>
  );
}

export default CompetitionAllRooms;
