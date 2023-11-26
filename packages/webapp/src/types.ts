export interface ApiCompetition {
  id: string;
  name: string;
  city_name: string;
  country_iso2: string;
  start_date: string;
  end_date: string;
  event_ids: string[];
}

export interface User {
  type: number;

  id: string;
  name: string;

  wcaId: string;
  countryId: string;
  avatar: {
    url: string;
    thumb_url: string;
  };

  wca: {
    accessToken: string;
    expiration: number;
    refreshToken: string;
  };

  exp: number;
}
