import { useMutation, useQuery } from '@tanstack/react-query';
import { useQuery as useApolloQuery } from '@apollo/client';
import React, { FormEventHandler, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetCompetitionQuery } from '../graphql';
import { Competition, Webhook } from '../generated/graphql';
import { Button, Input, UserLink } from '../components/Tailwind';
import WebhookList from '../components/WebhookList';
import CompetitionSchedule from '../components/Schedule';

const UserList = ({ users }: { users: User[] }) => (
  <>
    {users.map((user, i) => (
      <React.Fragment key={user.id}>
        {i > 0 && ', '}
        <UserLink href="/">{user.name}</UserLink>
      </React.Fragment>
    ))}
  </>
);

function CompetitionPage() {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const [sid, setSid] = useState('');

  useQuery({
    queryKey: ['CompetitionMessagingSid', competitionId],
    queryFn: async () => {
      const { sid } = await fetch(
        `${
          import.meta.env.VITE_NOTIFAPI_ORIGIN
        }/v0/external/admin/messagingService/${competitionId}`
      ).then((res) => res.json());
      setSid(sid?.sid ?? '');
      return sid.sid;
    },
  });

  const updateCompSid = useMutation({
    mutationFn: (newSid: string) => {
      return fetch(
        `${
          import.meta.env.VITE_NOTIFAPI_ORIGIN
        }/v0/external/admin/messagingService/${competitionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_NOTIFAPI_KEY,
          },
          body: JSON.stringify({
            sid: newSid,
          }),
        }
      );
    },
  });

  const { data: apiComp } = useQuery<ApiCompetition>({
    queryKey: ['Competition', competitionId],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_WCA_API_ORIGIN
        }/api/v0/competitions/${competitionId}`
      ).then((res) => res.json());
      return res;
    },
  });

  useEffect(() => {
    if (apiComp?.id && apiComp?.id !== competitionId) {
      navigate(`/competitions/${apiComp?.id}`, { replace: true });
    }
  }, [competitionId, apiComp]);

  const { data: compData } = useApolloQuery<{ competition: Competition }>(
    GetCompetitionQuery,
    {
      variables: {
        competitionId,
      },
    }
  );

  const handleUpdateSid: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    updateCompSid.mutate(sid);
  };

  return (
    <>
      <div className="flex flex-col w-full h-full space-y-2">
        <div className="p-2 shadow-md flex flex-col">
          <span className="p-1 text-xl">
            {apiComp?.name} ({apiComp?.start_date}) |{' '}
            {apiComp?.competitor_limit} Competitors
          </span>
          <span>Events: {apiComp?.event_ids.join(', ')}</span>
          <span>
            Delegates: <UserList users={apiComp?.delegates || []} />
          </span>
          <span>
            Organizers: <UserList users={apiComp?.organizers || []} />
          </span>
        </div>
        <form className="border border-gray-200 p-2" onSubmit={handleUpdateSid}>
          <label
            htmlFor="competitionSid"
            className="block text-gray-700 text-sm font-bold mb-2">
            Sid
          </label>
          <div className="flex space-x-2">
            <Input
              id="competitionSid"
              value={sid}
              onChange={(e) => setSid(e.target.value)}
            />
            <Button className="p-2">Change</Button>
          </div>
        </form>
        {compData?.competition && (
          <WebhookList webhooks={compData?.competition?.webhooks || []} />
        )}
        <CompetitionSchedule />
      </div>
    </>
  );
}

export default CompetitionPage;
