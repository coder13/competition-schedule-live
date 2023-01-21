/// <reference types="vite/client" />

type User = {
  id: number;
  name: string;
};

type ApiCompetition = {
  id: string;
  name: string;
  city: string;
  competitor_limit: number;
  country_iso2: string;
  delegates: User[];
  organizers: User[];
  start_date: string;
  event_ids: string[];
};
