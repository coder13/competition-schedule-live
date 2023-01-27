import { useCallback, useMemo, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  ButtonGroup,
  Container,
  Divider,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import pluralize from 'pluralize';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import { Activity } from '../../generated/graphql';
import {
  ActivitiesQuery,
  StartActivityMutation,
  StopActivityMutation,
  StopStartActivityMutation,
} from '../../graphql';
import { useWCIFContext } from './Layout';

const durationToMinutes = (start: Date, end: Date): number =>
  Math.round((end.getTime() - start.getTime()) / 1000 / 60);

// import red from '@mui/material/colors/red';
// import yellow from '@mui/material/colors/yellow';

const colorForLate = (minutes: number): string => {
  return 'white';
  // if (minutes <= -5) {
  // }

  // if (minutes < 0) {
  //   return yellow[100];
  // }

  // if (minutes < 5) {
  //   return red[200];
  // }

  // if (minutes < 15) {
  //   return red[300];
  // }

  // if (minutes < 60) {
  //   return red[100];
  // }

  // return red[300];
};

function CompetitionRoom() {
  const {
    wcif,
    loading: loadingWcif,
    activities,
    activitiesLoading,
  } = useWCIFContext();
  const { roomId } = useParams<{ roomId: string }>();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [startActivity] = useMutation<Activity>(StartActivityMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Started Activitiy!', data);
    },
    onError: (error) => {
      console.log('Error starting activity', error);
    },
  });

  const [stopActivity] = useMutation<Activity>(StopActivityMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Stopped Activitiy!', data);
    },
    onError: (error) => {
      console.log('Error stopping activity', error);
    },
  });

  const [stopAndStartActivity] = useMutation<{
    stop: Activity;
    start: Activity;
  }>(StopStartActivityMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Stopped Activitiy!', data.stop);
      console.log('Started Activitiy!', data.start);
    },
    onError: (error) => {
      console.log('Error advancing activities', error);
    },
  });

  const room = roomId
    ? wcif?.schedule.venues
        .map((venue) => venue.rooms)
        .flat()
        .find((room) => room.id === +roomId)
    : null;

  const childActivities = room?.activities
    .map((activity) =>
      activity?.childActivities?.length ? activity.childActivities : activity
    )
    .flat();

  const currentActivities = activities?.filter(
    (activity) => activity.startTime && !activity.endTime
  ) as Array<Activity & { startTime: string }>;

  const nextActivities = useMemo(
    () =>
      childActivities?.filter((activity) => {
        const liveActivity = activities?.find(
          (a) => a.activityId === activity.id
        );

        return (
          !liveActivity || (!liveActivity.startTime && !liveActivity.endTime)
        );
      }),
    [childActivities, activities]
  );

  const doneActivities = useMemo(
    () =>
      childActivities?.filter(
        (a) =>
          !nextActivities?.find((next) => next.id === a.id) &&
          !currentActivities?.find((current) => current.activityId === a.id)
      ),
    [nextActivities, childActivities]
  );

  const nextActivity = useMemo(() => {
    return nextActivities?.[0];
  }, [nextActivities]);

  const startStopActivity = (activityId: number) => {
    console.log('startStopActivity', activityId);
    if (currentActivities?.find((a) => a.activityId === activityId)) {
      stopActivity({
        variables: {
          competitionId: wcif?.id,
          activityId: activityId,
        },
      });
    } else {
      startActivity({
        variables: {
          competitionId: wcif?.id,
          activityId: activityId,
        },
      });
    }
  };

  const advanceToNextActivity = useCallback(() => {
    if (currentActivities?.length && nextActivity) {
      stopAndStartActivity({
        variables: {
          competitionId: wcif?.id,
          stopActivityId: currentActivities?.[0].activityId,
          startActivityId: nextActivity?.id,
        },
      });
    }
  }, [wcif, nextActivity, currentActivities]);

  const stopCurrentActivities = useCallback(() => {
    currentActivities?.forEach((activity) => {
      stopActivity({
        variables: {
          competitionId: wcif?.id,
          activityId: activity.activityId,
        },
      });
    });
  }, [currentActivities, stopActivity, wcif?.id]);

  const minutesTillNextActivity: number = useMemo(() => {
    if (!nextActivity) {
      return 0;
    }

    return Math.round(
      (new Date(nextActivity.startTime).getTime() - time.getTime()) / 1000 / 60
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
          {room?.name}
        </Typography>
        <Divider />
        <List dense>
          {nextActivities?.length ? (
            <>
              <ListSubheader disableSticky>Next</ListSubheader>
              {nextActivities?.map((activity) => {
                const liveActivity = activities?.find(
                  (a) => a.activityId === activity.id
                );
                let secondaryText = '';

                if (!liveActivity?.startTime) {
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
                  const minutes = durationToMinutes(
                    new Date(liveActivity.startTime),
                    new Date(liveActivity.endTime)
                  );
                  secondaryText = `Ended ${formatDuration({ minutes })} ${
                    minutes < 0 ? 'early' : 'late'
                  }`;
                }

                return (
                  <ListItemButton
                    disabled={!!liveActivity?.endTime}
                    onClick={() => startStopActivity(activity.id)}
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
                    disabled={!!liveActivity?.endTime}
                    onClick={() => startStopActivity(activity.id)}
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
              backgroundColor: nextActivity
                ? colorForLate(minutesTillNextActivity)
                : 'white',
            }}>
            <Typography variant="h6">
              Current {pluralize('Activity', currentActivities?.length)}
            </Typography>
            {currentActivities?.length === 0 ? (
              <b>None</b>
            ) : (
              <List dense>
                {currentActivities?.map((activity) => {
                  const wcifActivity = childActivities?.find(
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
                          childActivities?.find(
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
            {currentActivities?.length && nextActivity ? (
              <Button
                variant="contained"
                onClick={advanceToNextActivity}
                disabled={!currentActivities?.length || !nextActivity}>
                Advance to Next Activity
              </Button>
            ) : null}
            {!currentActivities?.length && nextActivity ? (
              <Button
                variant="contained"
                onClick={() => startStopActivity(nextActivity.id)}>
                Start Next Activity
              </Button>
            ) : null}

            <Button
              fullWidth
              variant="contained"
              onClick={stopCurrentActivities}
              disabled={!currentActivities?.length}>
              Stop Current {pluralize('activity', childActivities?.length || 0)}
            </Button>
          </ButtonGroup>
        </Paper>
      </Container>
    </div>
  );
}

export default CompetitionRoom;
