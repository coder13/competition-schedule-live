import { Container } from '@mui/material';
import { CompetitionList } from '../containers/CompetitionList';

function Home() {
  return (
    <Container maxWidth="md">
      <CompetitionList />
    </Container>
  );
}

export default Home;
