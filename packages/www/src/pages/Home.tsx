import { useQuery } from '@tanstack/react-query';
import { useQuery as useApolloQuery } from '@apollo/client';
import { Block, Button, Icon, Section } from 'react-bulma-components';
import { formatPhoneNumber } from 'react-phone-number-input';
import { Link, useNavigate } from 'react-router-dom';
import { notifApiFetch } from '../notifapi';
import { useAuth } from '../Providers/UserProvider';
import { ActivitiesSubscription, GetSomeCompetitionsQuery } from '../graphql';
import { Activity, Competition } from '../generated/graphql';
import { BarLoader } from 'react-spinners';
import CompetitionCard from '../components/CompetitionCard';
import { useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const { user, loading: isUserLoading } = useAuth();

  const competitionIds = Object.keys(user?.competitionSubscriptions || []);

  const {
    data: competitionsData,
    loading: isCompetitionsLoading,
    subscribeToMore,
  } = useApolloQuery<{
    competitions: Competition[];
  }>(GetSomeCompetitionsQuery, {
    variables: {
      competitionIds,
    },
    skip: !competitionIds?.length,
  });

  useEffect(() => {
    if (!competitionIds?.length) {
      return;
    }

    console.log('subscribing to more');

    const unsub = subscribeToMore<{ activity: Activity }>({
      document: ActivitiesSubscription,
      variables: { competitionIds },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData?.data?.activity) {
          return prev;
        }

        const newActivity = subscriptionData.data.activity;

        return {
          ...prev,
          competitions: prev.competitions.map((comp) => {
            if (comp.id !== newActivity.competitionId) {
              return comp;
            }

            return {
              ...comp,
              activities: [
                // replace the old activity with the new one
                ...(comp?.activities || []).filter(
                  (a) => a.activityId !== newActivity.activityId
                ),
                newActivity,
              ],
            };
          }),
        };
      },
    });

    return () => unsub();
  }, [competitionIds]);

  return (
    <>
      {isUserLoading || isCompetitionsLoading ? (
        <BarLoader width="100%" />
      ) : (
        <div style={{ height: '4px' }} />
      )}
      <Section>
        <Block className="has-text-justified">
          {user?.phoneNumber && (
            <p>Signed in with number {formatPhoneNumber(user?.phoneNumber)}</p>
          )}
        </Block>
        <hr />
        <>
          <Block
            style={{
              display: 'flex',
            }}>
            <span className="is-size-5">Competitions</span>
            <div
              style={{
                display: 'flex',
                flex: 1,
              }}
            />
            <Link
              to="/competitions"
              style={{
                border: 'none',
              }}>
              <Icon size="large">
                <i
                  className="fas fa-search is-size-5"
                  style={{ color: 'black' }}
                />
              </Icon>
            </Link>
          </Block>
          <Block className="flex flex-col space-y-4">
            {competitionsData?.competitions
              .filter(
                (comp) =>
                  !(comp.endDate < new Date().toISOString().split('T')[0])
              )
              .map((comp) => (
                <CompetitionCard key={comp.id} {...comp} />
              ))}
            {!isCompetitionsLoading && competitionIds.length === 0 && (
              <div className="flex justify-center">
                <Button
                  color="primary"
                  onClick={() => navigate('/competitions')}>
                  Find your competition!
                </Button>
              </div>
            )}
          </Block>
        </>
      </Section>
    </>
  );
}

export default Home;
