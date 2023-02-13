import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Block, Button, Icon, Section } from 'react-bulma-components';
import { useNavigate, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { List, ListItem } from '../components/List';
import SelectCompetitorsDialog from '../components/SelectCompetitorsDialog';
import SelectActivitiesDialog from '../components/SelectActivitiesDialog';
import useWCIF from '../hooks/useWCIF';
import { getCompetitionSubscriptions } from '../notifapi';

function Competition() {
  const navigate = useNavigate();
  const params = useParams();
  const competitionId = params.competitionId as string; // It is *going* to exist
  const { wcif, isLoading, getActivitiesForActivityCode } =
    useWCIF(competitionId);

  useEffect(() => {
    if (wcif && wcif?.id !== competitionId) {
      navigate(`/competitions/${wcif?.id}`, { replace: true });
    }
  }, [competitionId, wcif]);

  const [selectCompetitorsDialogOpen, setSelectCompetitorsDialogOpen] =
    useState(false);

  const [selectActivitiesDialogOpen, setSelectActivitiesDialogOpen] =
    useState(false);

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['subscriptions', 'competitions', competitionId],
    queryFn: async () =>
      (await getCompetitionSubscriptions(competitionId))[
        'subscriptions'
      ] as Subscription[],
  });

  const selectedPersons = useMemo(() => {
    if (!subscriptions) {
      return [];
    }

    return (
      wcif?.persons?.filter((p) =>
        subscriptions.some(
          (s) => s.type === 'competitor' && s.value === p.wcaUserId.toString()
        )
      ) || []
    );
  }, [subscriptions, wcif]);

  const selectedActivities = useMemo(() => {
    if (!subscriptions) {
      return [];
    }

    return subscriptions
      .filter((s) => s.type === 'activity')
      .map((s) => s.value);
  }, [subscriptions, wcif]);

  return (
    <>
      {isLoading || isLoadingSubscriptions ? (
        <BarLoader width="100%" />
      ) : (
        <div style={{ height: '4px' }} />
      )}
      <Block className="m-0"></Block>
      <Section className="divide-y-2 -mt-8 space-y-4">
        <div className="flex flex-col items-center">
          <p className="text-xl">{wcif?.name}</p>
          <p className="text-sm ">
            You will be notified of any competitors you subscribe to as well as
            any additional activities you subscribe to.
          </p>
        </div>
        <div>
          <Block className="flex items-center mb-1">
            <div className="flex flex-col">
              <span className="is-size-4">Competitors</span>
              <span className="text-sm">
                Subscribe to any competitors and you will be notified of all of
                their assignments.
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
              }}
            />
            <Button
              className="border-none"
              onClick={() => setSelectCompetitorsDialogOpen(true)}>
              <Icon size="large">
                <i className="fas fa-pencil is-size-5" />
              </Icon>
            </Button>
          </Block>
          <List>
            {selectedPersons.map((person) => (
              <ListItem key={person.name} primaryText={person.name} />
            ))}
            {selectedPersons.length === 0 && (
              <ListItem primaryText="No competitors selected" />
            )}
          </List>
        </div>
        <div>
          <Block className="flex items-center mb-1">
            <div className="flex flex-col">
              <span className="is-size-4">Extra Activities</span>
              <span className="text-sm">
                Subscribe to any other activities outside of your competitors'
                assignments.
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
              }}
            />
            <Button
              className="border-none"
              onClick={() => setSelectActivitiesDialogOpen(true)}>
              <Icon size="large">
                <i className="fas fa-pencil is-size-5" />
              </Icon>
            </Button>
          </Block>

          <List>
            {selectedActivities.map((activityCode) => {
              if (activityCode === '*') {
                return (
                  <ListItem key={activityCode} primaryText="All Activities" />
                );
              }
              const activities = getActivitiesForActivityCode(activityCode);

              return (
                <ListItem
                  key={activityCode}
                  primaryText={activities?.[0]?.name || ''}
                />
              );
            })}
            {selectedActivities.length === 0 && (
              <ListItem primaryText="No activities selected" />
            )}
          </List>
        </div>
      </Section>
      <SelectCompetitorsDialog
        open={selectCompetitorsDialogOpen}
        onClose={() => setSelectCompetitorsDialogOpen(false)}
      />
      <SelectActivitiesDialog
        open={selectActivitiesDialogOpen}
        onClose={() => setSelectActivitiesDialogOpen(false)}
      />
    </>
  );
}

export default Competition;
