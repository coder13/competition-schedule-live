/**
 * This page is where I'll want to get an overview of all comps imported with core-api as well as their statuses (and who the people to contact are)
 * I want to be able to view a competition and have full Start / Stop / Edit ability for activities
 * I want an overview of notifapi
 * I want to know how messages are doing being sent out
 * I want to be able to turn off notifications for anyone
 */

import { useNavigate } from 'react-router-dom';
import CompetitionList from '../components/CompetitionList';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <CompetitionList
        onSelect={(competitionId) => navigate(`/competitions/${competitionId}`)}
      />
    </div>
  );
}

export default Home;
