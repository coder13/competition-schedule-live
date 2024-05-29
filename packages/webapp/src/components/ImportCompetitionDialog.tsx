import React, { forwardRef } from 'react';
import FlagIconFactory from 'react-flag-icon-css';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery } from '@tanstack/react-query';
import { ApiCompetition } from '../types';
import { useAuth } from '../providers/AuthProvider';
import { gql, useMutation } from '@apollo/client';
import { ImportCompetitionMutation } from '../graphql';
import { useSnackbar } from 'notistack';

const FlagIcon = FlagIconFactory(React, { useCssModules: false });

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ImportCompetitionDialogProps {
  open: boolean;
  onClose: () => void;
  alreadyImported: string[];
}

function ImportCompetitionDialog({
  open,
  onClose,
  alreadyImported,
}: ImportCompetitionDialogProps) {
  const { wcaApiFetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading, data } = useQuery<ApiCompetition[]>({
    queryKey: ['competitions'],
    queryFn: () => {
      const query = new URLSearchParams({
        managed_by_me: 'true',
        start: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return wcaApiFetch(`/api/v0/competitions?${query.toString()}`);
    },
  });

  const [importCompetition, { loading }] = useMutation(
    ImportCompetitionMutation,
    {
      onCompleted: (data) => {
        console.log(`imported competition ${data.importCompetition.id}`);
        onClose();
      },
      onError: (error) => {
        console.error(error);
        enqueueSnackbar('Failed to import competition', { variant: 'error' });
      },
      refetchQueries: ['GetCompetitions'],
    }
  );

  const filteredCompetitions =
    data?.filter((competition) => !alreadyImported.includes(competition.id)) ||
    [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      TransitionComponent={Transition}>
      <DialogTitle>Import Competitions</DialogTitle>
      <Divider />
      {isLoading || loading ? <LinearProgress /> : null}
      <DialogContent sx={{ p: 0 }}>
        {filteredCompetitions.length === 0 ? (
          <div style={{ padding: theme.spacing(1) }}>
            <Typography>No competitions to import.</Typography>
          </div>
        ) : (
          <List>
            {filteredCompetitions
              .sort(
                (a, b) =>
                  new Date(a.start_date).getTime() -
                  new Date(b.start_date).getTime()
              )
              .map((competition) => (
                <ListItemButton
                  key={competition.id}
                  onClick={() =>
                    importCompetition({
                      variables: {
                        competitionId: competition.id,
                      },
                    })
                  }>
                  <ListItemIcon>
                    {!competition.country_iso2 ||
                    RegExp('(x|X)', 'g').test(
                      competition.country_iso2.toLowerCase()
                    ) ? (
                      <PublicIcon />
                    ) : (
                      <FlagIcon
                        code={competition.country_iso2.toLowerCase()}
                        size="lg"
                      />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={competition.name}
                    secondary={competition.start_date}
                  />
                </ListItemButton>
              ))}
          </List>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportCompetitionDialog;
