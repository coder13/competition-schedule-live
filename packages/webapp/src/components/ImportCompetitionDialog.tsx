import React, { forwardRef } from 'react';
import FlagIconFactory from 'react-flag-icon-css';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery } from '@tanstack/react-query';
import { ApiCompetition } from '../types';
import { useAuth } from '../providers/AuthProvider';
import { gql, useMutation } from '@apollo/client';

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
}

function ImportCompetitionDialog({
  open,
  onClose,
}: ImportCompetitionDialogProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading, error, data } = useQuery<ApiCompetition[]>({
    queryKey: ['competitions'],
    queryFn: () => {
      const query = new URLSearchParams({
        managed_by_me: 'true',
        start: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return fetch(
        `https://staging.worldcubeassociation.org/api/v0/competitions?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${user?.wca.accessToken}`,
          },
        }
      ).then((res) => res.json());
    },
  });

  const [importCompetition] = useMutation(
    gql`
      mutation ImportCompetition($competitionId: ID!) {
        importCompetition(competitionId: $competitionId) {
          id
          name
        }
      }
    `,
    {
      onCompleted: (data) => {
        console.log(`imported competition ${data.importCompetition.id}`);
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  console.log(48, user);
  console.log(isLoading, error, data);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      TransitionComponent={Transition}>
      <DialogTitle>Import Competition</DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <List>
          {data
            ?.sort(
              (a, b) =>
                new Date(a.start_date).getTime() -
                new Date(b.start_date).getTime()
            )
            .map((competition) => (
              <ListItemButton key={competition.id} onClick={() => }>
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
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportCompetitionDialog;
