import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Fab,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { User } from '../generated/graphql';
import ImportCompetitionDialog from '../components/ImportCompetitionDialog';
import { GetCompetitionsQuery } from '../graphql';

function CompetitionList() {
  const { data, loading } = useQuery<{ currentUser: User }>(
    GetCompetitionsQuery,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  console.log(35, data);

  const [importCompetitionDialogOpen, setImportCompetitionDialogOpen] =
    useState(false);

  return (
    <>
      {loading ? <LinearProgress /> : null}
      {data?.currentUser?.competitions ? (
        <List>
          {data.currentUser.competitions.map((competition) => (
            <ListItemButton key={competition.id}>
              <ListItemText
                primary={competition.name}
                secondary={competition.startDate}
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

export default CompetitionList;
