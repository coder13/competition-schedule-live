import { Request, Router } from 'express';
import {
  addCompetitionSubscriptions,
  getCompetitionSubscriptions,
  removeCompetitionSubscriptions,
  replaceCompetitionSubscriptions,
} from '../controllers/competitionSubscription';
import { getUser } from '../middlewares/user';

const router = Router();

router.get(
  '/competitions/:competitionId',
  getUser,
  async (req: Request, res) => {
    if (!req.user) {
      res.status(401).json({ success: false });
      return;
    }

    const subscriptions = await getCompetitionSubscriptions(req.user.id);
    res.json({
      success: true,
      subscriptions: subscriptions.map((s) => ({
        type: s.type,
        value: s.value,
      })),
    });
  }
);

/**
 * Takes a competition ID and subscribes the user to the specified activityCodes
 * POST /subscribe/competitions/:competitionId
 * Body: [{
 *     type: CompetitionSubscriptionType,
 *     value: string,
 *   }]
 */
router.post(
  '/competitions/:competitionId',
  getUser,
  // body()
  //   .isArray()
  //   .notEmpty()
  //   .withMessage('Must provide at least one subscription'),
  async (req: Request, res) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    try {
      const subscriptions = await addCompetitionSubscriptions(
        req.user.id,
        req.params.competitionId,
        req.body
      );

      res.json({
        success: true,
        subscriptions,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        success: false,
        message: 'Error occured while adding competition subscriptions',
      });
    }
  }
);

router.put(
  '/competitions/:competitionId',
  getUser,
  async (req: Request, res) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    const subscriptions = (
      await replaceCompetitionSubscriptions(
        req.user.id,
        req.params.competitionId,
        req.body
      )
    )[2];

    res.json({
      success: true,
      subscriptions,
    });
  }
);

router.delete('/:subscriptionId', getUser, async (req: Request, res) => {
  if (!req.user) {
    throw new Error('User not found');
  }

  await removeCompetitionSubscriptions([+req.params.subscriptionId]);

  res.json({
    success: true,
  });
});

router.post('/competitor/:competitorId/code');

export default router;
