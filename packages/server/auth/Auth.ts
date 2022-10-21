import express from 'express';

const WCA_ORIGIN = 'https://staging.worldcubeassociation.org';
const CLIENT_ID = 'example-application-id';
const CLIENT_SECRET = 'example-secret';
const REDIRECT_URI = 'http://localhost:8080/auth/wca/callback';

const router = express.Router();

router.get('/wca/', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'public email manage_competitions',
  });

  res.redirect(`${WCA_ORIGIN}/oauth/authorize?${params.toString()}`);
});

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

    res.json(await profileRes.json());
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

export default router;
