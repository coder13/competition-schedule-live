import { useEffect, useState } from 'react';

function CompetitionList({ onSelect }: { onSelect(id: string): void }) {
  const [search, setSearch] = useState('');
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);

  useEffect(() => {
    if (!search || search.length < 5) {
      return;
    }

    fetch(
      'https://www.worldcubeassociation.org/api/v0/search/competitions?q=' +
        search
    )
      .then(async (res) => {
        if (!res.ok) {
          console.error(await res.text());
          return;
        }

        return res.json();
      })
      .then((data) => {
        console.log(data?.result);
        setCompetitions(data?.result as ApiCompetition[]);
      });
  }, [search]);

  return (
    <div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Competition ID Search
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="competitionId"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col border-spacing-y-2">
        {competitions.map((competition) => (
          <div
            key={competition.id}
            className="border-b-2 border-gray-400 p-2 hover:opacity-80 hover:cursor-pointer"
            onClick={() => onSelect(competition.id)}>
            <span>
              {competition.name} ({competition.start_date})
            </span>
            <br />
            <div>
              Delegates: {competition.delegates.map((i) => i.name).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompetitionList;
