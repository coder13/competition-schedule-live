import React, { useCallback, useMemo } from 'react';
import {
  Avatar,
  Container,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  MenuList,
} from '@mui/material';
import { useCompetition } from './Layout';
import { Link } from '../../components/Link';

function CompetitionHome() {
  const { wcif, ongoingActivities } = useCompetition();

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
    return ongoingActivities?.map((activity) => ({
      ...activity,
      activity: getActivityDataForId(activity.activityId),
      room: getRoomByActivity(activity.activityId),
    }));
  }, [ongoingActivities, getActivityDataForId, getRoomByActivity]);

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
      <MenuList>
        <Divider />
        <MenuItem component={Link} to="webhooks">
          Configure webhooks
        </MenuItem>
        {/* <Button fullWidth variant="outlined">
          Configure access
        </Button> */}
      </MenuList>
    </Container>
  );
}

export default CompetitionHome;
