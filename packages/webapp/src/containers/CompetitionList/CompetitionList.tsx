import { formatDateRange } from '@notifycomp/frontend-common/lib';
import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  Fab,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
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
      {loading ? <LinearProgress /> : null}
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
      ) : null}
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
      ) : null}
      <Fab
        color="primary"
        aria-label="add"
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
        }}
        onClick={() => setImportCompetitionDialogOpen(true)}>
        <AddIcon />
      </Fab>
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
