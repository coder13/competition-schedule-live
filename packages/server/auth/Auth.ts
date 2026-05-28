import fs from 'fs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddlewareVerifyIgnoringExpiration } from './AuthMiddleware';
import { getMockUser, isMocksMode } from '../mocks/config';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

// TODO Should really be fetched from environment variables
// Depending on how we want to deploy this
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? fs.readFileSync('private.key');
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? fs.readFileSync('public.key');

const { WCA_ORIGIN, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

console.log('Loading values from environment variables', {
  WCA_ORIGIN,
  CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET ? '[redacted]' : undefined,
  REDIRECT_URI,
});

if (!isMocksMode() && !WCA_ORIGIN) {
  throw new Error('WCA_ORIGIN is not defined');
}
if (!isMocksMode() && !CLIENT_ID) {
  throw new Error('CLIENT_ID is not defined');
}
if (!isMocksMode() && !CLIENT_SECRET) {
  throw new Error('CLIENT_SECRET is not defined');
}
if (!isMocksMode() && !REDIRECT_URI) {
  throw new Error('REDIRECT_URI is not defined');
}

const resolvedWcaOrigin = WCA_ORIGIN ?? '';
const resolvedClientId = CLIENT_ID ?? '';
const resolvedClientSecret = CLIENT_SECRET ?? '';
const resolvedRedirectUri = REDIRECT_URI ?? '';

const SCOPE = 'public email manage_competitions';

const router = express.Router();

const createHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/x-www-form-urlencoded',
});

router.get('/keys/', (_, res) => {
  res.send(PUBLIC_KEY);
});

/**
 * Redirects user to WCA OAuth2 authorization page.
 */
router.get('/wca/', (req, res) => {
  if (isMocksMode()) {
    const redirectUri =
      typeof req.query.redirect_uri === 'string'
        ? req.query.redirect_uri
        : req.get('Referer') ?? REDIRECT_URI;

    if (!redirectUri) {
      res.status(400).send('Missing redirect_uri');
      return;
    }

    const url = new URL(redirectUri);
    url.searchParams.set('code', 'mock-wca-code');
    res.redirect(url.toString());
    return;
  }

  const redirectUri = req.get('Referer') ?? resolvedRedirectUri;

  const params = new URLSearchParams({
    client_id: resolvedClientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPE,
  });

  res.redirect(`${resolvedWcaOrigin}/oauth/authorize?${params.toString()}`);
});

const SignOpts: jwt.SignOptions = {
  algorithm: 'RS256',
  expiresIn: 2 * 24 * 60 * 60, // 2 days
};

const signJWT = async (
  profile: WcaprofileRes,
  token: WcaOauthRes,
  code: string
) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(
      {
        type: 1, // we'll  just use this incase we want to modify this data. We can throw away older tokens and require reauthentication

        // We really only need the id and name, but we'll include the rest of the data to not be too demanding on the WCA website
        id: profile.me.id,
        name: profile.me.name,
        wcaId: profile.me.wca_id,
        countryId: profile.me.country_iso2,
        avatar: profile.me.avatar,
        wca: {
          accessToken: token.access_token,
          expiration: new Date(Date.now() + token.expires_in * 1000).getTime(),
          refreshToken: token.refresh_token,
          code,
        },
      },
      String(PRIVATE_KEY),
      SignOpts,
      (err, token) => {
        if (err) {
          return reject(err);
        }

        if (!token) {
          return reject(new Error('Token is not defined'));
        }

        resolve(token);
      }
    );
  });

const resignJWT = async ({ exp, iat, ...data }: User) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(data, String(PRIVATE_KEY), SignOpts, (err, token) => {
      if (err) {
        return reject(err);
      }

      if (!token) {
        return reject(new Error('Token is not defined'));
      }

      resolve(token);
    });
  });

const signMockJWT = async () =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(getMockUser(), String(PRIVATE_KEY), SignOpts, (err, token) => {
      if (err) {
        return reject(err);
      }

      if (!token) {
        return reject(new Error('Token is not defined'));
      }

      resolve(token);
    });
  });

/**
 * Handles WCA OAuth2 callback. Fetches access token and user info.
 * Returns JWT token.
 */
router.get('/wca/callback', async (req, res) => {
  const { code } = req.query as { code: string };
  const redirectUri: string = req.get('Referer') ?? resolvedRedirectUri;

  if (typeof code !== 'string') {
    res.status(400).send('Missing code');
    return;
  }

  if (isMocksMode()) {
    return res.json({ jwt: await signMockJWT() });
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: resolvedClientId,
    client_secret: resolvedClientSecret,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetchWithTimeout(`${resolvedWcaOrigin}/oauth/token`, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw await response.text();
    }

    const wcaToken = (await response.json()) as WcaOauthRes;

    const profileRes = await fetchWithTimeout(
      `${resolvedWcaOrigin}/api/v0/me`,
      {
        headers: createHeaders(wcaToken.access_token),
      },
      { retries: 2 }
    );

    if (!profileRes.ok) {
      throw await profileRes.json();
    }

    const profile = (await profileRes.json()) as WcaprofileRes;
    const token = await signJWT(profile, wcaToken, code);

    return res.json({ jwt: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

router.post(
  '/wca/refresh',
  authMiddlewareVerifyIgnoringExpiration,
  async (req, res) => {
    if (!req.user) {
      return res.status(403).send('Unauthenticated');
    }

    if (isMocksMode()) {
      return res.json({ jwt: await resignJWT(req.user) });
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: resolvedClientId,
      client_secret: resolvedClientSecret,
      refresh_token: req.user.wca.refreshToken,
      code: req.user.wca.code,
      scope: SCOPE,
      redirect_uri: req.get('Referer') ?? resolvedRedirectUri,
    });

    try {
      const response = await fetchWithTimeout(`${resolvedWcaOrigin}/oauth/token`, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw await response.json();
      }

      const tokens = (await response.json()) as WcaOauthRes;

      const token = await resignJWT({
        ...req.user,
        wca: {
          ...req.user.wca,
          accessToken: tokens.access_token,
          expiration: new Date(Date.now() + tokens.expires_in * 1000).getTime(),
          refreshToken: tokens.refresh_token,
        },
      });

      return res.json({ jwt: token });
    } catch (e) {
      console.error(e);
      res.status(500).json(e);
    }
  }
);

export default router;
