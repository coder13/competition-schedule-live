import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEventHandler, useState } from 'react';
import { useParams } from 'react-router-dom';

function Competition() {
  const { competitionId } = useParams();
  const [sid, setSid] = useState('');

  const { data: competitionMessagingSid } = useQuery({
    queryKey: ['CompetitionMessagingSid', competitionId],
    queryFn: async () => {
      const { sid } = await fetch(
        `http://localhost:8090/v0/external/admin/messagingService/${competitionId}`
      ).then((res) => res.json());
      setSid(sid?.sid ?? '');
      return sid.sid;
    },
  });

  const updateCompSid = useMutation({
    mutationFn: (newSid: string) => {
      return fetch(
        `http://localhost:8090/v0/external/admin/messagingService/${competitionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sid: newSid,
          }),
        }
      );
    },
  });

  const { data: compData } = useQuery({
    queryKey: ['Competition', competitionId],
    queryFn: async () => {
      const res = await fetch(
        `https://www.worldcubeassociation.org/api/v0/competitions/${competitionId}`
      ).then((res) => res.json());
      return res;
    },
  });

  const handleUpdateSid = async (e: FormEventHandler<HTMLFormElement>) => {
    e.preventDefault();
    await updateCompSid.mutate(sid);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="p-1">{compData?.name}</h1>
      <hr />
      <form onSubmit={handleUpdateSid}>
        <label
          htmlFor="competitionSid"
          className="block text-gray-700 text-sm font-bold mb-2">
          Sid
        </label>
        <div className="flex">
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="competitionSid"
            value={sid}
            onChange={(e) => setSid(e.target.value)}
          />
          <button className="p-2">Change</button>
        </div>
      </form>
    </div>
  );
}

export default Competition;
