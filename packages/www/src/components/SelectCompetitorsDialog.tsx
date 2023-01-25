import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Person } from '@wca/helpers';
import { Button, Modal } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
import useWCIF from '../hooks/useWCIF';
import { getCompetitionSubscriptions, notifApiFetch } from '../notifapi';
import { List, ListItem } from './List';
import TriStateCheckIcon from './TriStateCheckIcon';

interface SelectCompetitorsDialogProps {
  open: boolean;
  onClose: () => void;
}

type SubscriptionWithId = Subscription & { id: number };

function SelectCompetitorsDialog({
  open,
  onClose,
}: SelectCompetitorsDialogProps) {
  const params = useParams();
  const queryClient = useQueryClient();

  const competitionId = params.competitionId as string; // It is *going* to exist
  const { wcif } = useWCIF(competitionId);
  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', 'competitions', competitionId],
    queryFn: async () =>
      (await getCompetitionSubscriptions(competitionId))[
        'subscriptions'
      ] as SubscriptionWithId[],
  });

  const subscribeToCompetitor = useMutation({
    mutationFn: async (competitorId: number) => {
      return (
        await notifApiFetch(
          `/v0/internal/subscriptions/competitions/${competitionId}`,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'competitor',
              value: competitorId.toString(),
            }),
          }
        )
      ).subscription;
    },
    onSuccess: (data: SubscriptionWithId) => {
      console.log(48, data, subscriptions);
      // Replace the entire array with the new array since we are bulk modifying *all* of the subscriptions with this endpoint
      queryClient.setQueryData<SubscriptionWithId[]>(
        ['subscriptions', 'competitions', competitionId],
        (oldData) => [...(oldData || []), data]
      );
    },
  });

  const unsubscribeToCompetitor = useMutation({
    mutationFn: (subscriptionId: number) => {
      return notifApiFetch(`/v0/internal/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, subscriptionId) => {
      console.log(subscriptions);
      // Replace the entire array with the new array since we are bulk modifying *all* of the subscriptions with this endpoint
      queryClient.setQueryData<SubscriptionWithId[]>(
        ['subscriptions', 'competitions', competitionId],
        (oldData) => oldData?.filter((s) => s.id !== subscriptionId)
      );
    },
  });

  const findSubscription = (personUserId: number) =>
    subscriptions?.find(
      (s) => s.type === 'competitor' && s.value === personUserId.toString()
    );

  const handleListItemSelect = (person: Person) => {
    console.log(subscriptions);
    console.log(person);
    const subscription = findSubscription(person.wcaUserId);
    if (subscription) {
      unsubscribeToCompetitor.mutate(subscription.id);
    } else {
      subscribeToCompetitor.mutate(person.wcaUserId);
    }
  };

  return (
    <Modal show={open} onClose={onClose} showClose={false}>
      <Modal.Card>
        <Modal.Card.Header>
          <Modal.Card.Title>Select Competitors</Modal.Card.Title>
        </Modal.Card.Header>
        <Modal.Card.Body>
          <List>
            {wcif?.persons
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((person) => (
                <ListItem
                  key={person.registrantId}
                  icon={
                    <TriStateCheckIcon
                      checked={!!findSubscription(person.wcaUserId)}
                    />
                  }
                  primaryText={person.name}
                  secondaryText={person.wcaId || undefined}
                  onClick={() => handleListItemSelect(person)}
                />
              ))}
          </List>
        </Modal.Card.Body>
        <Modal.Card.Footer>
          Select competitors to receive notifications for when they are called
          up
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}

export default SelectCompetitorsDialog;
