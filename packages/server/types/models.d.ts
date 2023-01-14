interface User {
  type: number;

  id: number;
  name: string;

  wcaId: string;
  countryId: string;
  avatar: {
    url: string;
  };

  wca: {
    accessToken: string;
    exp: number;
    refreshToken: string;
  };

  iat: number;
  exp: number;
}

interface WcaOauthRes {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface WcaprofileRes {
  me: wcaProfile;
}

interface WcaProfile {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  // delegate_status?: 'delegate' | 'trainee_delegate' | 'junior_delegate' | 'senior_delegate',
  // wca_id: string,
  // gender: 'm' | 'f' | 'o';
  country_iso2: string;
  // url: string;
  email: string;
  // region: string;
  // senior_delegate_id: number;
  // class: 'user',
  // teams: Team[]
  avatar: {
    url: string;
    pending_url: string;
    thumb_url: string;
    url: string;
  };
}
