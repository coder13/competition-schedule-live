import { useQuery } from '@apollo/client';
import { Block, Icon, Section } from 'react-bulma-components';
import CompetitionList from '../components/CompetitionList';
import { Competition } from '../generated/graphql';
import { GetCompetitionsQuery } from '../graphql';

function Competitions() {
  const { data } = useQuery<{ competitions: Competition[] }>(
    GetCompetitionsQuery
  );

  return (
    <Section>
      <Block>
        <p className="is-size-4">Competitions</p>
        <p className="is-size-6">
          Select an upcoming competition to subscribe to its notifications.
        </p>
      </Block>
      <hr />
      <CompetitionList competitions={data?.competitions || []} />
    </Section>
  );
}

export default Competitions;
