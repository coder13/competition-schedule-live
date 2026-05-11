import { Request, Router } from 'express';
import { competitionGroupsAuth } from '../../../middlewares/competitionGroupsAuth';
import {
  disableCompetitionGroupsPushSubscription,
  PushWatchInput,
  upsertCompetitionGroupsPushSubscription,
} from '../../../controllers/pushSubscriptions';

const router = Router();

interface SubscriptionBody {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
  watches?: PushWatchInput[];
}

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
  if (!process.env.VAPID_PUBLIC_KEY) {
    res.status(503).json({
      success: false,
      message: 'VAPID public key is not configured',
    });
    return;
  }

  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY,
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
      subscription: {
        id: subscription.id,
        endpoint: subscription.endpoint,
        watches: subscription.watches.map((watch) => ({
          competitionId: watch.competitionId,
          wcaUserId: watch.wcaUserId,
        })),
      },
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid push subscription',
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
