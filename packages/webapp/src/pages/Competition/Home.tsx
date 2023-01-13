import React from 'react';
import {
  Avatar,
  Container,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import { useWCIFContext } from './Layout';
import { Link } from '../../components/Link';

function CompetitionHome() {
  const { wcif } = useWCIFContext();

  return (
    <Container maxWidth="md">
      <List>
        {wcif?.schedule.venues.map((venue) => (
          <React.Fragment key={venue.id}>
            <ListSubheader sx={{ lineHeight: 1, mb: 2 }}>
              {venue.name}
            </ListSubheader>
            {venue.rooms.map((room) => (
              <ListItemButton
                component={Link}
                to={`rooms/${room.id}`}
                key={room.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: room.color }} />
                </ListItemAvatar>
                <ListItemText primary={room.name} />
              </ListItemButton>
            ))}
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
}

export default CompetitionHome;
