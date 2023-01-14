import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Container,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
} from '@mui/material';
import { useWCIFContext } from './Layout';
import { Link } from '../../components/Link';
import { ActivitiesQuery, ActivitiesSubscription } from '../../graphql';
import { useQuery } from '@apollo/client';
import { Activity } from '../../generated/graphql';

function CompetitionHome() {
  const { wcif } = useWCIFContext();
  const { data: currentActivities, subscribeToMore } = useQuery<{
    activities: Activity[];
  }>(ActivitiesQuery, {
    variables: { competitionId: wcif?.id },
  });

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

  useEffect(() => {
    if (!wcif?.id) {
      return;
    }

    const unsub = subscribeToMore<{ activity: Activity }>({
      document: ActivitiesSubscription,
      variables: { competitionId: wcif?.id },
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

  const getActivityDataForId = useCallback(
    (activityId: number) => {
      return allActivities?.find((a) => a.id === activityId);
    },
    [allActivities]
  );

  const liveActivitiesWithRoom = useMemo(() => {
    return currentActivities?.activities?.map((activity) => ({
      ...activity,
      activity: getActivityDataForId(activity.activityId),
      room: getRoomByActivity(activity.activityId),
    }));
  }, [currentActivities, getActivityDataForId, getRoomByActivity]);

  return (
    <Container maxWidth="md">
      <List>
        {wcif?.schedule.venues.map((venue) => (
          <React.Fragment key={venue.id}>
            <ListSubheader sx={{ lineHeight: 1, mb: 2 }}>
              {venue.name}
            </ListSubheader>
            {venue.rooms.map((room) => {
              const liveActivities = liveActivitiesWithRoom?.filter(
                (a) => a.room?.id === room.id && !a.endTime
              );

              return (
                <ListItemButton
                  component={Link}
                  to={`rooms/${room.id}`}
                  key={room.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: room.color }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.name}
                    secondary={`Ongoing: ${
                      liveActivities
                        ?.map((a) => a?.activity?.name)
                        .join(', ') || 'None'
                    }`}
                  />
                </ListItemButton>
              );
            })}
          </React.Fragment>
        ))}
      </List>
      {/* <Stack spacing={1}>
        <Divider />
        <Button fullWidth variant="outlined">
          Configure webhooks
        </Button>
        <Button fullWidth variant="outlined">
          Configure access
        </Button>
      </Stack> */}
    </Container>
  );
}

export default CompetitionHome;
