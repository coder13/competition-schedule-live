import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Fab,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Competition } from '../generated/graphql';
import ImportCompetitionDialog from '../components/ImportCompetitionDialog';
import { useAuth } from '../providers/AuthProvider';

const GetCompetitionsQuery = gql`
  query GetCompetitions {
    competitions {
      id
      name
      startDate
      endDate
      country
    }
  }
`;

function CompetitionList() {
  const { data, loading } = useQuery<{ competitions: Competition[] }>(
    GetCompetitionsQuery,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  const [importCompetitionDialogOpen, setImportCompetitionDialogOpen] =
    useState(false);

  return (
    <>
      {loading ? <LinearProgress /> : null}
      {data ? (
        <List>
          {data.competitions.map((competition) => (
            <ListItem key={competition.id}>
              <ListItemText primary={competition.name} />
            </ListItem>
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
      />
    </>
  );
}

export default CompetitionList;
