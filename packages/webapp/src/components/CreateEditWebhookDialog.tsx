import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useEffect, useState } from 'react';
import { HttpMethod, Webhook, WebhookInput } from '../generated/graphql';
import { useMutation } from '@apollo/client';
import {
  CreateWebhookMutation,
  DeleteWebhookMutation,
  TestEditingWebhookMutation,
  UpdateWebhookMutation,
  WebhooksQuery,
} from '../graphql';
import { useParams } from 'react-router-dom';
import { useConfirm } from 'material-ui-confirm';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CreateEditWebhookDialogProps {
  open: boolean;
  onClose: () => void;
  webhook?: Webhook;
}

function CreateEditWebhookDialog({
  open,
  onClose,
  webhook,
}: CreateEditWebhookDialogProps) {
  const confirm = useConfirm();
  const { competitionId } = useParams<{ competitionId: string }>();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [url, setUrl] = useState(webhook?.url ?? '');
  const [method, setMethod] = useState<HttpMethod>(
    webhook?.method ?? HttpMethod.Post
  );

  useEffect(() => {
    setUrl(webhook?.url ?? '');
    setMethod(webhook?.method ?? HttpMethod.Post);
  }, [webhook]);

  const [createWebhook] = useMutation<{
    competitionId: string;
    webhookId: number;
    webhook: WebhookInput;
  }>(CreateWebhookMutation, {
    refetchQueries: [WebhooksQuery],
    onCompleted: (data) => {
      console.log('Created webhook!', data);
      onClose();
    },
    onError: (error) => {
      console.log('Error created webhook', error);
    },
  });

  const [updateWebhook] = useMutation<{
    id: number;
    webhook: WebhookInput;
  }>(UpdateWebhookMutation, {
    refetchQueries: [WebhooksQuery],
    onCompleted: (data) => {
      console.log('Created webhook!', data);
      onClose();
    },
    onError: (error) => {
      console.log('Error created webhook', error);
    },
  });

  const [deleteWebhook] = useMutation<{
    id: number;
  }>(DeleteWebhookMutation, {
    refetchQueries: [WebhooksQuery],
    onCompleted: (data) => {
      console.log('Deleted webhook!', data);
      onClose();
    },
    onError: (error) => {
      console.log('Error deleting webhook', error);
    },
  });

  const [testWebhook] = useMutation(TestEditingWebhookMutation);

  const handleSave = () => {
    if (webhook) {
      updateWebhook({
        variables: {
          id: webhook.id,
          webhook: {
            url,
            method,
          },
        },
      });
    } else {
      createWebhook({
        variables: {
          competitionId: competitionId,
          webhook: {
            url,
            method,
          },
        },
      });
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhook) {
      return;
    }

    await confirm({
      title: 'Delete Webhook',
      description: 'Are you sure you want to delete this webhook?',
    });
    deleteWebhook({
      variables: {
        id: webhook?.id ?? 0,
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xl"
      TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close">
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {webhook ? 'Edit' : 'Create'} Webhook
          </Typography>
          <Button autoFocus color="inherit" onClick={handleSave}>
            {webhook ? 'Save' : 'Create'}
          </Button>
        </Toolbar>
      </AppBar>
      <Divider />
      <DialogContent>
        <Stack spacing={2}>
          <FormControl fullWidth variant="outlined">
            <TextField
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Method</InputLabel>
            <Select
              label="Method"
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              variant="outlined">
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="PATCH">PATCH</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          <Divider />
          <Button
            variant="outlined"
            onClick={() =>
              testWebhook({
                variables: {
                  competitionId,
                  webhook: {
                    url,
                    method,
                  },
                },
              })
            }>
            Test Webhook
          </Button>
          {webhook && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteWebhook}>
              Delete Webhook
            </Button>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default CreateEditWebhookDialog;
