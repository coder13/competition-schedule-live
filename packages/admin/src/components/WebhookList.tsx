import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { Webhook } from '../generated/graphql';
import { DeleteWebhookMutation, GetCompetitionQuery } from '../graphql';
import { Button } from './Tailwind';
import WebhookDialog from './WebhookDialog';

function WebhookList({ webhooks }: { webhooks: Webhook[] }) {
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [webhookToEdit, setWebhookToEdit] = useState<Webhook>();

  const [deleteWebhook] = useMutation<{
    id: number;
  }>(DeleteWebhookMutation, {
    refetchQueries: [GetCompetitionQuery],
    onCompleted: (data) => {
      console.log('Deleted webhook!', data);
    },
    onError: (error) => {
      console.log('Error deleting webhook', error);
    },
  });

  return (
    <>
      <div className="border border-gray-200">
        <div className="flex justify-between p-2">
          <span className="text-lg">Webhooks</span>
          <Button onClick={() => setWebhookDialogOpen(true)}>
            Create Webhook
          </Button>
        </div>
        <div>
          {webhooks?.length === 0 && <b className="p-2">None</b>}
          {webhooks?.map((wh) => (
            <div
              key={wh.id}
              className="flex p-2 space-x-2 hover:bg-gray-100 transition-colors items-center">
              <span>{wh.method}</span>
              <span>{wh.url}</span>
              <div className="flex flex-1" />
              <Button
                onClick={() => {
                  setWebhookDialogOpen(true);
                  setWebhookToEdit(wh);
                }}>
                Edit
              </Button>
              <Button
                className="bg-red-500"
                onClick={() =>
                  deleteWebhook({
                    variables: {
                      id: wh.id,
                    },
                  })
                }>
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      <WebhookDialog
        open={webhookDialogOpen}
        webhook={webhookToEdit}
        onRequestClose={() => {
          setWebhookDialogOpen(false);
          setWebhookToEdit(undefined);
        }}
      />
    </>
  );
}

export default WebhookList;
