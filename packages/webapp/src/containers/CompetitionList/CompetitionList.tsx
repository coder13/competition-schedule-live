import { formatDateRange } from '@notifycomp/frontend-common/lib';
import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { User } from '../../generated/graphql';
import ImportCompetitionDialog from '../../components/ImportCompetitionDialog';
import { GetCompetitionsQuery } from '../../graphql';
import { Link } from '../../components/Link';

export function CompetitionList() {
  const { data, loading } = useQuery<{ currentUser: User }>(
    GetCompetitionsQuery,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  const [importCompetitionDialogOpen, setImportCompetitionDialogOpen] =
    useState(false);

  const upcomingCompetitions = useMemo(() => {
    return data?.currentUser?.competitions
      ? [...data.currentUser.competitions]
          .filter((comp) => {
            return comp.startDate > new Date().toISOString();
          })
          .sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )
      : [];
  }, [data]);

  const pastCompetitions = useMemo(
    () =>
      data?.currentUser?.competitions
        ? [...data.currentUser.competitions]
            .filter((comp) => {
              return comp.startDate < new Date().toISOString();
            })
            .sort(
              (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime()
            )
        : [],
    [data]
  );

  return (
    <>
      <Box flex={1} flexDirection="column" p={2} sx={{ width: '100%' }}>
        {loading ? <LinearProgress /> : null}
        <Button
          color="primary"
          className="w-full"
          variant="outlined"
          onClick={() => setImportCompetitionDialogOpen(true)}>
          Import Competition
        </Button>
        {upcomingCompetitions.length ? (
          <List>
            <ListSubheader>My Upcoming Competitions</ListSubheader>
            {upcomingCompetitions.map((competition) => (
              <ListItemButton
                component={Link}
                to={`/competitions/${competition.id}`}
                key={competition.id}>
                <ListItemText
                  primary={competition.name}
                  secondary={formatDateRange(
                    competition.startDate,
                    competition.endDate
                  )}
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography variant="body2" sx={{ padding: 2 }}>
            No upcoming competitions
          </Typography>
        )}
        {pastCompetitions.length ? (
          <List>
            <ListSubheader>My Past Competitions</ListSubheader>
            {pastCompetitions.map((competition) => (
              <ListItemButton
                component={Link}
                to={`/competitions/${competition.id}`}
                key={competition.id}>
                <ListItemText
                  primary={competition.name}
                  secondary={formatDateRange(
                    competition.startDate,
                    competition.endDate
                  )}
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography variant="body2" sx={{ padding: 2 }}>
            No past competitions
          </Typography>
        )}
      </Box>
      <ImportCompetitionDialog
        open={importCompetitionDialogOpen}
        onClose={() => setImportCompetitionDialogOpen(false)}
        alreadyImported={
          data?.currentUser?.competitions?.map((c) => c.id) ?? []
        }
      />
    </>
  );
}
