interface User {
  type: number;

  id: string;
  name: string;

  wcaId: string;
  countryId: string;
  avatar: {
    url: string;
  };

  accessToken: string;
  wcaExpAt: number;
  refreshToken: string;

  exp: number;
}

interface AppContext {
  user?: User;
  db: PrismaClient;
}
