import { LinearProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Competition } from '@wca/helpers';
import { createContext, useContext, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { StoreContext } from '../../providers/BasicStoreProvider';

interface IWCIFContext {
  wcif?: Competition;
  loading?: boolean;
}

const WCIFContext = createContext<IWCIFContext>({});

function CompetitionLayout() {
  const { wcaApiFetch } = useAuth();
  const [_, setAppTitle] = useContext(StoreContext).appTitle;
  const { competitionId } = useParams<{ competitionId: string }>();
  const { isLoading, data: wcif } = useQuery<Competition>({
    queryKey: ['public'],
    queryFn: () =>
      wcaApiFetch(`api/v0/competitions/${competitionId || ''}/wcif/public`),
  });

  useEffect(() => {
    setAppTitle(wcif?.name || 'Competition Schedule Live');
  }, [wcif?.name]);

  return (
    <WCIFContext.Provider value={{ loading: isLoading, wcif }}>
      {isLoading ? <LinearProgress /> : null}
      <Outlet />
    </WCIFContext.Provider>
  );
}

export const useWCIFContext = () => useContext(WCIFContext);

export default CompetitionLayout;
