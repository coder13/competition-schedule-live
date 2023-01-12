import { useCallback, useMemo, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  ButtonGroup,
  Container,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
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

function CompetitionRoom() {
  const { wcif, loading: loadingWcif } = useWCIFContext();
  const { roomId } = useParams<{ roomId: string }>();
  const { data: activities, loading: loadingActivities } = useQuery<{
    activities: Activity[];
  }>(ActivitiesQuery, {
    variables: { competitionId: wcif?.id },
    skip: !wcif?.id,
  });

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

  const currentActivities = activities?.activities?.filter(
    (activity) => !activity.endTime
  );

  const nextActivity = useMemo(() => {
    if (!childActivities || !activities) {
      return;
    }

    const sortedActivities = childActivities.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const nextActivity = sortedActivities.find(
      (a) => !activities.activities.find((b) => b.activityId === a.id)
    );

    return nextActivity;
  }, [activities, childActivities]);

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

  return (
    <Container maxWidth="md">
      {loadingWcif || loadingActivities ? <LinearProgress /> : null}
      <h1>{room?.name}</h1>
      <Divider />
      <div style={{ marginTop: '1em', marginBottom: '1em' }}>
        <Typography>
          Current Activities:
          {currentActivities?.length === 0 ? 'None' : null}
          <List dense>
            {currentActivities?.map((activity) => (
              <ListItem
                button
                onClick={() => startStopActivity(activity.activityId)}
                key={activity.activityId}>
                <ListItemText
                  primary={
                    childActivities?.find((a) => a.id === activity.activityId)
                      ?.name
                  }
                  secondary={`Duration: ${formatDuration(
                    intervalToDuration({
                      start: new Date(activity.startTime),
                      end: time,
                    })
                  )}`}
                />
              </ListItem>
            ))}
          </List>
        </Typography>
        <ButtonGroup>
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

          {childActivities?.length ? (
            <Button variant="contained">
              Stop Current {pluralize('activity', childActivities.length)}
            </Button>
          ) : null}
        </ButtonGroup>
      </div>
      <Divider />
      <div style={{ marginTop: '1em', marginBottom: '1em' }}>
        {nextActivity ? (
          <Typography>
            Next Activity: <b>{nextActivity.name}</b> scheduled to start in{' '}
            {formatDuration(
              intervalToDuration({
                start: time,
                end: new Date(nextActivity.startTime),
              })
            )}
          </Typography>
        ) : (
          <Typography>No more upcoming activities!</Typography>
        )}
      </div>
      <Divider />
      <List dense>
        {childActivities?.map((activity) => (
          <ListItem
            button
            onClick={() => startStopActivity(activity.id)}
            key={activity.id}>
            <ListItemText
              primary={activity.name}
              secondary={new Date(activity.startTime).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default CompetitionRoom;
