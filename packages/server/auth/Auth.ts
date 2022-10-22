import fs from 'fs';
import express from 'express';
import jwt from 'jsonwebtoken';

// TODO Should really be fetched from environment variables
// Depending on how we want to deploy this
const PRIVATE_KEY = fs.readFileSync('private.key');

const WCA_ORIGIN = 'https://staging.worldcubeassociation.org';
const CLIENT_ID = 'example-application-id';
const CLIENT_SECRET = 'example-secret';
const REDIRECT_URI = 'http://localhost:8080/auth/wca/callback';

const router = express.Router();

/**
 * Redirects user to WCA OAuth2 authorization page.
 */
router.get('/wca/', (_, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'public email manage_competitions',
  });

  res.redirect(`${WCA_ORIGIN}/oauth/authorize?${params.toString()}`);
});

/**
 * Handles WCA OAuth2 callback. Fetches access token and user info.
 * Returns JWT token.
 */
router.get('/wca/callback', async (req, res) => {
  const { code } = req.query;

  if (typeof code !== 'string') {
    res.status(400).send('Missing code');
    return;
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
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

    const token = await response.json();

    const profileRes = await fetch(`${WCA_ORIGIN}/api/v0/me`, {
      headers: {
        Authorization: `Bearer ${token.access_token as string}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileRes.ok) {
      throw await profileRes.json();
    }

    const profile = await profileRes.json();

    jwt.sign(
      {
        type: 1, // we'll  just use this incase we want to modify this data. We can throw away older tokens and require reauthentication

        // We really only need the id and name, but we'll include the rest of the data to not be too demanding on the WCA website
        id: profile.me.id,
        name: profile.me.name,
        wcaId: profile.me.wca_id,
        countryId: profile.me.country_iso2,
        avatar: profile.me.avatar,

        accessToken: token.access_token,
        wcaExpAt: new Date(Date.now() + token.expires_in * 1000).getTime(),
        refreshToken: token.refresh_token,
      },
      PRIVATE_KEY,
      {
        algorithm: 'RS256',
        expiresIn: 2 * 24 * 60 * 60,
      },
      (err, token) => {
        if (err !== null) {
          res.status(500).json(err);
          return;
        }

        if (token !== undefined) {
          res.json({ jwt: token });
          return;
        }

        res.status(500).json({ message: 'Token is undefined' });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

export default router;
