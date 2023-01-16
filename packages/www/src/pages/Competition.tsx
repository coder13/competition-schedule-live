import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Icon, Panel, Section } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import PanelBlockWithHover from '../components/PanelBlockWithHover';
import useWCIF from '../hooks/useWCIF';
import {
  updateCompetitionSubscriptions,
  getCompetitionSubscriptions,
} from '../notifapi';

const List = ({ children }: { children: React.ReactNode }) => {
  return <Panel shadowless>{children}</Panel>;
};

const ListItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <PanelBlockWithHover onClick={onClick}>{children}</PanelBlockWithHover>
  );
};

function Competition() {
  const params = useParams();
  const queryClient = useQueryClient();
  const competitionId = params.competitionId as string; // It is *going* to exist
  const {
    wcif,
    isLoading,
    allUniqueActivityCodes,
    getActivitiesForActivityCode,
  } = useWCIF(competitionId);

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['subscriptions', 'competitions', competitionId],
    queryFn: async () =>
      (await getCompetitionSubscriptions(competitionId))[
        'subscriptions'
      ] as Subscription[],
  });

  const toggleSubscriptions = useMutation({
    mutationFn: (toggleSubs: Subscription[]) => {
      const newSubscriptions = toggleSubs.reduce((acc = [], sub) => {
        const index = acc.findIndex(
          (s) => s.type === sub.type && s.value === sub.value
        );

        if (index !== -1) {
          return acc.filter((_, i) => i !== index);
        } else {
          return [...acc, sub];
        }
      }, subscriptions);

      return updateCompetitionSubscriptions(
        competitionId,
        newSubscriptions || []
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Subscription[]>(
        ['subscriptions', 'competitions', competitionId],
        data.subscriptions
      );
    },
  });

  const toggleSelected = (activityCode: string) => {
    toggleSubscriptions.mutate([{ type: 'activity', value: activityCode }]);
  };

  const selectedActivityCodes = subscriptions
    ?.filter((s) => s.type === 'activity')
    .map((s) => s.value);

  return (
    <>
      {isLoading || isLoadingSubscriptions || toggleSubscriptions.isLoading ? (
        <BarLoader width="100%" />
      ) : (
        <div style={{ height: '4px' }} />
      )}
      <Section>
        <p>{wcif?.name}</p>
        <hr />
        <p>Select activities to receive notifications for</p>
        <br />
        <List>
          {allUniqueActivityCodes.map((activityCode) => {
            const activities = getActivitiesForActivityCode(activityCode);
            const isSelected = selectedActivityCodes?.includes(activityCode);

            return (
              <ListItem
                key={activityCode}
                onClick={() => toggleSelected(activityCode)}>
                <Icon size="medium">
                  {isSelected && <i className="fas fa-check is-size-5" />}
                </Icon>
                <span className="is-size-6">{activities?.[0]?.name}</span>
              </ListItem>
            );
          })}
        </List>
      </Section>
    </>
  );
}

export default Competition;
