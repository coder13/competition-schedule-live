import React, { createContext, useContext, useState } from 'react';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { Competition } from '@wca/helpers';

const WCA_API_URL = 'https://staging.worldcubeassociation.org/api/v0';

interface IWCIFContext {
  competitionId?: string;
  setCompetitionId: (competitionId: string) => void;
  wcif?: Competition;
  loading: boolean;
}

const WCIFContext = createContext<IWCIFContext>({
  setCompetitionId: () => null,
  loading: false,
});

export default function WCIFProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [competitionId, setCompetitionId] = useState<string>();

  const { data: wcif, isLoading } = useReactQuery<Competition>({
    queryKey: ['competition', competitionId],
    queryFn: async () => {
      console.log(
        'fetching',
        `${WCA_API_URL}/competitions/${competitionId ?? ''}/wcif/public`
      );
      const response = await fetch(
        `${WCA_API_URL}/competitions/${competitionId ?? ''}/wcif/public`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log(53);
      return response.json();
    },
    enabled: !!competitionId,
  });

  return (
    <WCIFContext.Provider
      value={{ competitionId, setCompetitionId, wcif, loading: isLoading }}>
      {children}
    </WCIFContext.Provider>
  );
}

export const useWCIF = () => useContext(WCIFContext);
