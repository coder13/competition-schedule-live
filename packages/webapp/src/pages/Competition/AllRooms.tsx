import { useCallback, useMemo } from 'react';
import { useMutation } from '@apollo/client';
import {
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import { Activity } from '../../generated/graphql';
import {
  ActivitiesQuery,
  ResetActivityMutation,
  StartActivitiesMutation,
  StopActivitiesMutation,
} from '../../graphql';
import { useCompetition } from './Layout';
import { useConfirm } from 'material-ui-confirm';
import {
  filterBetterActivityCode,
  mapToBetterActivityCode,
} from '../../lib/activities';
import { ActivityCodeDataObject } from '../../types';

function CompetitionAllRooms() {
  const confirm = useConfirm();
  const {
    wcif,
    loading: loadingWcif,
    activities,
    activitiesLoading,
    rooms,
    getRoomForActivity,
  } = useCompetition();

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

  const [resetActivity] = useMutation<Activity>(ResetActivityMutation, {
    refetchQueries: [ActivitiesQuery],
    onCompleted: (data) => {
      console.log('Reset Activity!', data);
    },
    onError: (error) => {
      console.log('Error resetting activity', error);
    },
  });

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

    uniqueActivityCodes?.forEach((activityCode) => {
      const childActivities = childActivitiesForActivityCode(activityCode);
      if (!childActivities) {
        return;
      }

      const betterCode = mapToBetterActivityCode(childActivities[0]);
      const liveActivities = activities?.filter((a) =>
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
          const { scheduledActivities, liveActivities } =
            activitiesByActivityCodeMap[activityCode];

          return scheduledActivities.every(
            (sa) =>
              liveActivities.find((la) => la.activityId === sa.id)?.endTime
          );
        })
        .map((activityCode) => activitiesByActivityCodeMap[activityCode]),
    [nextActivities, allChildActivities]
  );

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

    // const stopping = scheduledActivities?.filter((a) => {

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

  const handleResetActivities = useCallback(
    async ({ name, scheduledActivities }: ActivityCodeDataObject) => {
      const roomsForActivities = scheduledActivities.map((a) =>
        getRoomForActivity(a)
      );

      await confirm({
        content: (
          <>
            <p>
              This will reset activity: <b>{name}</b> in rooms:{' '}
              {roomsForActivities.map((r) => r?.name).join(', ')}
            </p>
            <p>
              The start and stop times will reset as if the activity never
              happened.
            </p>
          </>
        ),
        confirmationText: 'Reset',
      });

      scheduledActivities.forEach((a) => {
        resetActivity({
          variables: {
            competitionId: wcif?.id,
            activityId: a.id,
          },
        });
      });
    },
    [wcif, allChildActivities]
  );

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
        <Box p={1}>
          <Typography variant="h4" sx={{ p: 1 }}>
            All Rooms
          </Typography>
          <Button variant="contained">Configure Auto-advance</Button>
        </Box>
        <Divider />
        <List dense>
          {nextActivities?.length ? (
            <>
              <ListSubheader disableSticky>Next</ListSubheader>
              {nextActivities?.map((activityCodeDataObj) => {
                const { activityCode, scheduledActivities, name } =
                  activityCodeDataObj;
                const startTimes = [
                  ...new Set(scheduledActivities?.map((ca) => ca.startTime)),
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
                    onClick={() => startOrStopActivities(activityCodeDataObj)}
                    key={[activityCode, name].join('')}>
                    <ListItemText primary={name} secondary={secondaryText} />
                  </ListItemButton>
                );
              })}
            </>
          ) : null}
          {doneActivities?.length ? (
            <>
              <ListSubheader disableSticky>Done</ListSubheader>
              {doneActivities.map((activityCodeDataObj) => {
                const { activityCode, name } = activityCodeDataObj;

                return (
                  <ListItemButton
                    onClick={() => handleResetActivities(activityCodeDataObj)}
                    key={[activityCode, name].join('')}>
                    <ListItemText primary={name} />
                  </ListItemButton>
                );
              })}
            </>
          ) : null}
        </List>
      </Container>
    </div>
  );
}

export default CompetitionAllRooms;
