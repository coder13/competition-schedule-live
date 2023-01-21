import { ApolloError, useMutation } from '@apollo/client';
import { FormEventHandler, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useParams } from 'react-router-dom';

import { HttpMethod, Webhook, WebhookInput } from '../generated/graphql';
import {
  CreateWebhookMutation,
  GetCompetitionQuery,
  UpdateWebhookMutation,
} from '../graphql';
import { Button, Input, Select } from './Tailwind';

interface ModalDialogProps {
  open: boolean;
  onRequestClose: () => void;
  /**
   * The webhook to edit, or undefined if creating a new webhook.
   */
  webhook?: Webhook;
}

Modal.setAppElement('#root');

function WebhookDialog({ open, webhook, onRequestClose }: ModalDialogProps) {
  const { competitionId } = useParams();
  const [url, setUrl] = useState(webhook?.url ?? '');
  const [method, setMethod] = useState<HttpMethod>(
    webhook?.method ?? HttpMethod.Get
  );

  useEffect(() => {
    setUrl(webhook?.url ?? '');
    setMethod(webhook?.method ?? HttpMethod.Get);
  }, [webhook]);

  const [createWebhook, { error: createError }] = useMutation<{
    competitionId: string;
    webhookId: number;
    webhook: WebhookInput;
  }>(CreateWebhookMutation, {
    refetchQueries: [GetCompetitionQuery],
    onCompleted: (data) => {
      console.log('Created webhook!', data);
      onRequestClose();
    },
    onError: (error) => {
      console.log('Error created webhook', error);
    },
  });
  const [updateWebhook, { error: updateError }] = useMutation<{
    id: number;
    webhook: WebhookInput;
  }>(UpdateWebhookMutation, {
    refetchQueries: [GetCompetitionQuery],
    onCompleted: (data) => {
      console.log('Created webhook!', data);
      onRequestClose();
    },
    onError: (error) => {
      console.log('Error created webhook', error);
    },
  });

  const handleCreate = () => {
    createWebhook({
      variables: {
        competitionId,
        webhook: {
          url,
          method,
          headers: [],
        },
      },
    });
  };

  const handleUpdate = () => {
    updateWebhook({
      variables: {
        id: webhook?.id,
        webhook: {
          url,
          method,
          headers: [],
        },
      },
    });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (webhook) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <Modal
      isOpen={open}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        content: {
          width: '50%',
          minWidth: '60em',
          minHeight: '20em',
          inset: 'auto',
          display: 'flex',
          flexDirection: 'column',
        },
      }}>
      <div className="mb-4 -mt-2">
        {webhook ? 'Edit Webhook' : 'Create Webhook'}
      </div>
      {([createError, updateError].filter((x) => !!x) as ApolloError[]).map(
        (error) => (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
            <span className="block sm:inline">{error.message}</span>
          </div>
        )
      )}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex space-x-2 items-center">
          <label htmlFor="webhookUrlInput">URL</label>
          <Input
            id="webhookUrlInput"
            name="webhookUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 items-center">
          <label htmlFor="webhookMethodInput">Method</label>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
          </Select>
        </div>
        <div className="flex space-x-2 items-center">
          <label>Headers</label>
        </div>
      </form>
      <div className="flex flex-1" />
      <div className="flex justify-between">
        {webhook ? (
          <Button onClick={handleUpdate}>Edit</Button>
        ) : (
          <Button onClick={handleCreate}>Create</Button>
        )}
        <Button className="bg-red-500" onClick={onRequestClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default WebhookDialog;
