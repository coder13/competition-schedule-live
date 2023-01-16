import { Competition } from '../generated/graphql';

interface CompetitionListProps {
  competitions: Competition[];
}

function CompetitionList({ competitions }: CompetitionListProps) {
  return (
    <div>
      {competitions.map((competition) => (
        <div key={competition.id}>
          <h1>{competition.name}</h1>
          <button>View</button>
        </div>
      ))}
    </div>
  );
}

export default CompetitionList;
