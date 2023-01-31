import { useQuery } from '@apollo/client';
import {
  Container,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useParams } from 'react-router-dom';
import { Competition, Webhook } from '../../generated/graphql';
import { WebhooksQuery } from '../../graphql';
import { useState } from 'react';
import CreateEditWebhookDialog from '../../components/CreateEditWebhookDialog';

function CompetitionWebhooks() {
  const { competitionId } = useParams<{ competitionId: string }>();

  const [addWebhookDialogOpen, setAddWebhookDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<undefined | Webhook>();

  const { data: webhooksData } = useQuery<{
    competition: Competition & { webhooks: Webhook[] };
  }>(WebhooksQuery, {
    variables: { competitionId },
  });

  return (
    <Container maxWidth="md">
      <Typography sx={{ p: 2 }}>
        Webhooks will be sent to the URL you provide below whenever an activity
        is started.
      </Typography>
      <Divider />
      <List>
        {webhooksData?.competition?.webhooks?.map((webhook) => (
          <ListItem
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => {
                  setEditingWebhook(webhook);
                  setAddWebhookDialogOpen(true);
                }}>
                <EditIcon />
              </IconButton>
            }>
            <ListItemText primary={webhook.url} secondary={webhook.method} />
          </ListItem>
        ))}
        {webhooksData?.competition?.webhooks?.length === 0 && (
          <ListItemButton onClick={() => setAddWebhookDialogOpen(true)}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create Webhook" />
          </ListItemButton>
        )}
      </List>
      <CreateEditWebhookDialog
        open={addWebhookDialogOpen}
        onClose={() => {
          setEditingWebhook(undefined);
          setAddWebhookDialogOpen(false);
        }}
        webhook={editingWebhook}
      />
    </Container>
  );
}

export default CompetitionWebhooks;
