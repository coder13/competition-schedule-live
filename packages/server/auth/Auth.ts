import fs from 'fs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddlewareDecode } from './AuthMiddleware';

// TODO Should really be fetched from environment variables
// Depending on how we want to deploy this
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? fs.readFileSync('private.key');
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? fs.readFileSync('public.key');

console.log(process.env.CLIENT_ID, process.env.WCA_ORIGIN);

const WCA_ORIGIN =
  process.env.WCA_ORIGIN ?? 'https://staging.worldcubeassociation.org';
const CLIENT_ID = process.env.CLIENT_ID ?? 'example-application-id';
const CLIENT_SECRET = process.env.CLIENT_SECRET ?? 'example-secret';
const REDIRECT_URI = 'http://localhost:8080/auth/wca/callback';
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
  const redirectUri = req.query.redirect_uri?.toString() ?? REDIRECT_URI;
  console.log(26, redirectUri);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPE,
  });

  res.redirect(`${WCA_ORIGIN}/oauth/authorize?${params.toString()}`);
});

const signJWT = async (
  profile: {
    me: {
      id: number;
      name: string;
      wca_id: string;
      country_iso2: string;
      avatar: {
        url: string;
        thumbUrl: string;
      };
    };
  },
  token: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }
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
          exp: new Date(Date.now() + token.expires_in * 1000).getTime(),
          refreshToken: token.refresh_token,
        },
      },
      String(PRIVATE_KEY),
      {
        algorithm: 'RS256',
        expiresIn: 2 * 24 * 60 * 60,
      },
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

const resignJWT = async (data: User) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(
      data,
      String(PRIVATE_KEY),
      {
        algorithm: 'RS256',
        expiresIn: 2 * 24 * 60 * 60,
      },
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

/**
 * Handles WCA OAuth2 callback. Fetches access token and user info.
 * Returns JWT token.
 */
router.get('/wca/callback', async (req, res) => {
  const { code } = req.query as { code: string };
  const redirectUri: string =
    req.query.redirect_uri?.toString() ?? REDIRECT_URI;

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

    const wcaToken = await response.json();

    const profileRes = await fetch(`${WCA_ORIGIN}/api/v0/me`, {
      headers: createHeaders(wcaToken.access_token),
    });

    if (!profileRes.ok) {
      throw await profileRes.json();
    }

    const profile = await profileRes.json();
    const token = await signJWT(profile, wcaToken);

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
    scope: SCOPE,
  });

  try {
    const response = await fetch(`${WCA_ORIGIN}/oauth/token`, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokens = await response.json();
    console.log(204, tokens);

    const token = await resignJWT({
      ...req.user,
      wca: {
        ...req.user.wca,
        accessToken: tokens.access_token,
        exp: new Date(Date.now() + tokens.expires_in * 1000).getTime(),
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
