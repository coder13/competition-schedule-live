import { Request, Router } from 'express';
import { competitionGroupsAuth } from '../../../middlewares/competitionGroupsAuth';
import {
  disableCompetitionGroupsPushSubscription,
  disableCompetitionGroupsPushSubscriptionSession,
  PushWatchInput,
  testCompetitionGroupsPushSubscriptionSession,
  updateCompetitionGroupsPushSubscriptionSession,
  upsertCompetitionGroupsPushSubscription,
} from '../../../controllers/pushSubscriptions';
import {
  signCompetitionGroupsPushSessionToken,
  verifyCompetitionGroupsPushSessionToken,
} from '../../../lib/competitionGroupsPushSessionToken';

const router = Router();
const VAPID_PUBLIC_KEY_PATTERN = /^[A-Za-z0-9_-]{40,256}$/;

interface SubscriptionBody {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
  watches?: PushWatchInput[];
}

interface SubscriptionResponseInput {
  id: number;
  endpoint: string;
  watches: PushWatchInput[];
}

const bearerToken = (req: Request) => {
  const authorization = req.headers.authorization;
  return authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;
};

const serializeSubscription = (subscription: SubscriptionResponseInput) => ({
  id: subscription.id,
  endpoint: subscription.endpoint,
  watches: subscription.watches.map((watch) => ({
    competitionId: watch.competitionId,
    wcaUserId: watch.wcaUserId,
  })),
});

const normalizeWatches = (
  watches: PushWatchInput[] | undefined,
  allowedWcaUserIds: number[]
) => {
  if (!Array.isArray(watches)) {
    throw new Error('watches must be an array');
  }

  return watches.map((watch) => {
    if (
      !watch ||
      typeof watch.competitionId !== 'string' ||
      !watch.competitionId.trim() ||
      !Number.isInteger(watch.wcaUserId)
    ) {
      throw new Error('Invalid watch');
    }

    if (!allowedWcaUserIds.includes(watch.wcaUserId)) {
      throw new Error('Token is not allowed to watch this WCA user');
    }

    return {
      competitionId: watch.competitionId.trim(),
      wcaUserId: watch.wcaUserId,
    };
  });
};

router.get('/vapid-public-key', (_, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    res.status(503).json({
      success: false,
      message: 'VAPID public key is not configured',
    });
    return;
  }

  if (!VAPID_PUBLIC_KEY_PATTERN.test(publicKey)) {
    res.status(503).json({
      success: false,
      message: 'VAPID public key is not valid',
    });
    return;
  }

  res.json({
    success: true,
    publicKey,
  });
});

router.post('/subscriptions', competitionGroupsAuth, async (req: Request, res) => {
  if (!req.competitionGroups) {
    res.status(401).json({ success: false });
    return;
  }

  const { endpoint, p256dh, auth, watches } = req.body as SubscriptionBody;

  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({
      success: false,
      message: 'Missing endpoint, p256dh, or auth',
    });
    return;
  }

  try {
    const subscription = await upsertCompetitionGroupsPushSubscription({
      endpoint,
      p256dh,
      auth,
      externalSubject: req.competitionGroups.sub,
      watches: normalizeWatches(watches, req.competitionGroups.wcaUserIds),
    });

    res.status(201).json({
      success: true,
      subscription: serializeSubscription(subscription),
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid push subscription',
    });
  }
});

router.post('/sessions', competitionGroupsAuth, async (req: Request, res) => {
  if (!req.competitionGroups) {
    res.status(401).json({ success: false });
    return;
  }

  const { endpoint, p256dh, auth, watches } = req.body as SubscriptionBody;

  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({
      success: false,
      message: 'Missing endpoint, p256dh, or auth',
    });
    return;
  }

  try {
    const subscription = await upsertCompetitionGroupsPushSubscription({
      endpoint,
      p256dh,
      auth,
      externalSubject: req.competitionGroups.sub,
      watches: normalizeWatches(watches, req.competitionGroups.wcaUserIds),
    });
    const sessionToken = signCompetitionGroupsPushSessionToken({
      pushSubscriptionId: subscription.id,
      sub: req.competitionGroups.sub,
      wcaUserIds: req.competitionGroups.wcaUserIds,
    });

    res.status(201).json({
      success: true,
      sessionToken,
      subscription: serializeSubscription(subscription),
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid push session',
    });
  }
});

router.put('/sessions/current', async (req: Request, res) => {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'Missing bearer token' });
    return;
  }

  const { endpoint, p256dh, auth, watches } = req.body as SubscriptionBody;

  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({
      success: false,
      message: 'Missing endpoint, p256dh, or auth',
    });
    return;
  }

  try {
    const claims = verifyCompetitionGroupsPushSessionToken(token);
    const subscription = await updateCompetitionGroupsPushSubscriptionSession({
      endpoint,
      p256dh,
      auth,
      externalSubject: claims.sub,
      pushSubscriptionId: claims.pushSubscriptionId,
      watches: normalizeWatches(watches, claims.wcaUserIds),
    });

    res.json({
      success: true,
      subscription: serializeSubscription(subscription),
    });
  } catch (e) {
    res.status(401).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid push session',
    });
  }
});

router.delete('/sessions/current', async (req: Request, res) => {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'Missing bearer token' });
    return;
  }

  try {
    const claims = verifyCompetitionGroupsPushSessionToken(token);
    await disableCompetitionGroupsPushSubscriptionSession(
      claims.pushSubscriptionId,
      claims.sub
    );

    res.json({ success: true });
  } catch (e) {
    res.status(401).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid push session',
    });
  }
});

router.post('/sessions/current/test', async (req: Request, res) => {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: 'Missing bearer token' });
    return;
  }

  try {
    const claims = verifyCompetitionGroupsPushSessionToken(token);
    const result = await testCompetitionGroupsPushSubscriptionSession(
      claims.pushSubscriptionId,
      claims.sub
    );

    if (!result.success) {
      const statusCode = result.error?.statusCode;
      const responseStatus =
        statusCode === 401 || statusCode === 403 ? 410 : 502;

      res.status(responseStatus).json({
        success: false,
        message: result.error?.message ?? 'Unable to send test notification',
        error: result.error,
      });
      return;
    }

    res.json({ success: true });
  } catch (e) {
    res.status(401).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid push session',
    });
  }
});

router.delete(
  '/subscriptions',
  competitionGroupsAuth,
  async (req: Request, res) => {
    if (!req.competitionGroups) {
      res.status(401).json({ success: false });
      return;
    }

    const { endpoint } = req.body as { endpoint?: string };
    if (!endpoint) {
      res.status(400).json({ success: false, message: 'Missing endpoint' });
      return;
    }

    await disableCompetitionGroupsPushSubscription(
      endpoint,
      req.competitionGroups.sub
    );

    res.json({ success: true });
  }
);

export default router;
