import fs from 'fs';
import express from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { authMiddlewareDecode } from './AuthMiddleware';

// TODO Should really be fetched from environment variables
// Depending on how we want to deploy this
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? fs.readFileSync('private.key');
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? fs.readFileSync('public.key');

const { WCA_ORIGIN, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

console.log('Loading values from environment variables', {
  WCA_ORIGIN,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
});

if (!WCA_ORIGIN) {
  throw new Error('WCA_ORIGIN is not defined');
}
if (!CLIENT_ID) {
  throw new Error('CLIENT_ID is not defined');
}
if (!CLIENT_SECRET) {
  throw new Error('CLIENT_SECRET is not defined');
}
if (!REDIRECT_URI) {
  throw new Error('REDIRECT_URI is not defined');
}

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
  const redirectUri = req.get('Referer') ?? REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPE,
  });

  res.redirect(`${WCA_ORIGIN}/oauth/authorize?${params.toString()}`);
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

/**
 * Handles WCA OAuth2 callback. Fetches access token and user info.
 * Returns JWT token.
 */
router.get('/wca/callback', async (req, res) => {
  const { code } = req.query as { code: string };
  const redirectUri: string = req.get('Referer') ?? REDIRECT_URI;

  if (typeof code !== 'string') {
    res.status(400).send('Missing code');
    return;
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(`${WCA_ORIGIN}/oauth/token`, {
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

    const profileRes = await fetch(`${WCA_ORIGIN}/api/v0/me`, {
      headers: createHeaders(wcaToken.access_token),
    });

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

router.post('/wca/refresh', authMiddlewareDecode, async (req, res) => {
  if (!req.user) {
    return res.status(403).send('Unauthenticated');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: req.user.wca.refreshToken,
    code: req.user.wca.code,
    scope: SCOPE,
    redirect_uri: req.get('Referer') ?? REDIRECT_URI,
  });

  try {
    const response = await fetch(`${WCA_ORIGIN}/oauth/token`, {
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
});

export default router;
