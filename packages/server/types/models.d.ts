interface User {
  type: number;

  id: string;
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

  exp: number;
}
