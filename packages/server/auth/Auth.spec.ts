/* eslint-disable import/first */
type Handler = (req: MockRequest, res: MockResponse) => unknown;

interface MockRequest {
  query: Record<string, unknown>;
  user?: User;
  get: jest.Mock;
}

interface MockResponse {
  send: jest.Mock;
  json: jest.Mock;
  status: jest.Mock;
  redirect: jest.Mock;
}

interface LoadedAuth {
  getRoutes: Record<string, Handler>;
  postRoutes: Record<string, Handler>;
  fetchMock: jest.Mock;
  jwtSign: jest.Mock;
}

const createResponse = (): MockResponse => {
  const response = {
    send: jest.fn(),
    json: jest.fn(),
    status: jest.fn(),
    redirect: jest.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
};

const createRequest = ({
  query = {},
  referer = 'https://app.example/callback',
  user,
}: {
  query?: Record<string, unknown>;
  referer?: string | null;
  user?: User;
} = {}): MockRequest => ({
  query,
  user,
  get: jest.fn().mockReturnValue(referer),
});

const loadAuth = async (
  mocksMode: boolean,
  props: { redirectUri?: string } = { redirectUri: 'https://app.example/callback' }
): Promise<LoadedAuth> => {
  jest.resetModules();

  const getRoutes: Record<string, Handler> = {};
  const postRoutes: Record<string, Handler> = {};
  const fetchMock = jest.fn();
  const jwtSign = jest.fn(
    (
      _payload: unknown,
      _key: string,
      _opts: unknown,
      callback: (error: Error | null, token?: string) => void
    ) => {
      callback(null, 'signed-jwt');
    }
  );

  process.env = {
    ...process.env,
    PRIVATE_KEY: 'private-key',
    PUBLIC_KEY: 'public-key',
    WCA_ORIGIN: 'https://wca.example',
    CLIENT_ID: 'client-id',
    CLIENT_SECRET: 'client-secret',
    REDIRECT_URI: props.redirectUri,
  };
  if (!props.redirectUri) {
    delete process.env.REDIRECT_URI;
  }

  jest.doMock('express', () => ({
    __esModule: true,
    default: {
      Router: jest.fn(() => ({
        get: jest.fn((path: string, handler: Handler) => {
          getRoutes[path] = handler;
        }),
        post: jest.fn((path: string, _middleware: unknown, handler: Handler) => {
          postRoutes[path] = handler;
        }),
      })),
    },
  }));
  jest.doMock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
      sign: jwtSign,
    },
  }));
  jest.doMock('node-fetch', () => ({
    __esModule: true,
    default: fetchMock,
  }));
  jest.doMock('../mocks/config', () => ({
    isMocksMode: jest.fn(() => mocksMode),
    getMockUser: jest.fn(() => ({
      id: 123,
      name: 'Mock User',
    })),
  }));
  jest.doMock('./AuthMiddleware', () => ({
    authMiddlewareDecode: jest.fn(
      (req: MockRequest, _res: MockResponse, next: () => void) => next()
    ),
  }));

  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  await import('./Auth');

  return {
    getRoutes,
    postRoutes,
    fetchMock,
    jwtSign,
  };
};

describe('Auth router', () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('returns the public key', async () => {
    const { getRoutes } = await loadAuth(false);
    const response = createResponse();

    getRoutes['/keys/'](createRequest(), response);

    expect(response.send).toHaveBeenCalledWith('public-key');
  });

  it('redirects mock WCA auth requests back with a mock code', async () => {
    const { getRoutes } = await loadAuth(true);
    const response = createResponse();

    getRoutes['/wca/'](
      createRequest({
        query: { redirect_uri: 'https://app.example/login' },
      }),
      response
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'https://app.example/login?code=mock-wca-code'
    );
  });

  it('uses the configured redirect URI fallback for mock WCA auth requests', async () => {
    const { getRoutes } = await loadAuth(true);
    const response = createResponse();

    getRoutes['/wca/'](
      createRequest({
        referer: null,
      }),
      response
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'https://app.example/callback?code=mock-wca-code'
    );
  });

  it('redirects real WCA auth requests to the OAuth authorize URL', async () => {
    const { getRoutes } = await loadAuth(false);
    const response = createResponse();

    getRoutes['/wca/'](createRequest(), response);

    expect(response.redirect).toHaveBeenCalledWith(
      'https://wca.example/oauth/authorize?client_id=client-id&response_type=code&redirect_uri=https%3A%2F%2Fapp.example%2Fcallback&scope=public+email+manage_competitions'
    );
  });

  it('rejects callbacks without an OAuth code', async () => {
    const { getRoutes } = await loadAuth(false);
    const response = createResponse();

    await getRoutes['/wca/callback'](createRequest(), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith('Missing code');
  });

  it('exchanges an OAuth code for a signed app JWT', async () => {
    const { getRoutes, fetchMock, jwtSign } = await loadAuth(false);
    const response = createResponse();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          me: {
            id: 123,
            name: 'Test User',
            wca_id: '2026TEST01',
            country_iso2: 'US',
            avatar: { url: 'https://avatar.example/me.png' },
          },
        }),
      });

    await getRoutes['/wca/callback'](
      createRequest({ query: { code: 'oauth-code' } }),
      response
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://wca.example/oauth/token',
      expect.objectContaining({ method: 'POST' })
    );
    expect(fetchMock).toHaveBeenCalledWith('https://wca.example/api/v0/me', {
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    expect(jwtSign).toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({ jwt: 'signed-jwt' });
  });

  it('returns callback exchange errors as 500 responses', async () => {
    const { getRoutes, fetchMock } = await loadAuth(false);
    const response = createResponse();
    fetchMock.mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('bad oauth code'),
    });

    await getRoutes['/wca/callback'](
      createRequest({ query: { code: 'bad-code' } }),
      response
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith('bad oauth code');
  });

  it('rejects refresh requests without an authenticated user', async () => {
    const { postRoutes } = await loadAuth(false);
    const response = createResponse();

    await postRoutes['/wca/refresh'](createRequest(), response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.send).toHaveBeenCalledWith('Unauthenticated');
  });

  it('refreshes WCA tokens and resigns the current user', async () => {
    const { postRoutes, fetchMock } = await loadAuth(false);
    const response = createResponse();
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      }),
    });

    await postRoutes['/wca/refresh'](
      createRequest({
        user: {
          id: 123,
          name: 'Test User',
          type: 1,
          wcaId: '2026TEST01',
          countryId: 'US',
          avatar: { url: '' },
          wca: {
            accessToken: 'old-access-token',
            expiration: 0,
            refreshToken: 'old-refresh-token',
            code: 'old-code',
          },
          iat: 1,
          exp: 2,
        },
      }),
      response
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://wca.example/oauth/token',
      expect.objectContaining({ method: 'POST' })
    );
    expect(response.json).toHaveBeenCalledWith({ jwt: 'signed-jwt' });
  });

  it('returns refresh errors as 500 responses', async () => {
    const { postRoutes, fetchMock } = await loadAuth(false);
    const response = createResponse();
    fetchMock.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'invalid refresh token' }),
    });

    await postRoutes['/wca/refresh'](
      createRequest({
        user: {
          id: 123,
          name: 'Test User',
          type: 1,
          wcaId: '2026TEST01',
          countryId: 'US',
          avatar: { url: '' },
          wca: {
            accessToken: 'old-access-token',
            expiration: 0,
            refreshToken: 'old-refresh-token',
            code: 'old-code',
          },
          iat: 1,
          exp: 2,
        },
      }),
      response
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: 'invalid refresh token',
    });
  });
});
