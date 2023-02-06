import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import {
  addCompetitionSubscription,
  getCompetitionSubscriptions,
  removeCompetitionSubscriptions,
  replaceCompetitionSubscriptions,
} from '../../../controllers/competitionSubscription';
import { handleErrors } from '../../../middlewares/errors';
import { getUser } from '../../../middlewares/user';
import { CompetitionSubscriptionType } from '../../../prisma/generated/client';

const router = Router();

/**
 * GET /v0/internal/subscriptions/competitions/:competitionId
 */
router.get(
  '/competitions/:competitionId',
  getUser,
  async (req: Request, res) => {
    if (!req.user) {
      res.status(401).json({ success: false });
      return;
    }

    const subscriptions = await getCompetitionSubscriptions(
      req.params.competitionId,
      req.user.id
    );
    res.json({
      success: true,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        type: s.type,
        value: s.value,
      })),
    });
  }
);

const isArrayOfSubscriptions = body().custom((subscriptions) => {
  const validTypes = Object.values(CompetitionSubscriptionType);
  for (const subscription of subscriptions) {
    if (!validTypes.includes(subscription.type)) {
      throw new Error('Invalid subscription type');
    }
    console.log(subscription.value, typeof subscription.value);
    if (typeof subscription.value !== 'string') {
      throw new Error('Subscription value must be a string');
    }
  }
  return true;
});

/**
 * Takes a competition ID and creates a single subscription
 * POST /v0/internal/subscriptions/competitions/:competitionId
 * Body: {
 *     type: CompetitionSubscriptionType,
 *     value: string,
 *   }
 */
router.post(
  '/competitions/:competitionId',
  getUser,
  body('type')
    .isString()
    .custom((type) =>
      Object.values(CompetitionSubscriptionType).includes(type)
    ),
  body('value').isString(),
  handleErrors,
  async (req: Request, res) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    try {
      const subscription = await addCompetitionSubscription(
        req.user.id,
        req.params.competitionId,
        req.body.type,
        req.body.value
      );

      res.json({
        success: true,
        subscription,
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

/**
 * PUT /v0/internal/subscriptions/competitions/:competitionId
 * Takes a competition ID and replaces the user's subscriptions with the specified activityCodes
 */
router.put(
  '/competitions/:competitionId',
  body().isArray().withMessage('Body must be an array'),
  isArrayOfSubscriptions,
  handleErrors,
  getUser,
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    try {
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
    } catch (e) {
      console.error(e);
      res.status(500).json({
        success: false,
        message: 'Error occured while updating competition subscriptions',
      });
    }
  }
);

/**
 * Takes a subscription ID and removes the subscription
 *
 * DELETE /v0/internal/subscriptions/:subscriptionId
 */
router.delete(
  '/:subscriptionId',
  param('subscriptionId').isNumeric(),
  handleErrors,
  getUser,
  async (req: Request, res) => {
    if (!req.user) {
      throw new Error('User not found');
    }

    await removeCompetitionSubscriptions([+req.params.subscriptionId]);

    res.json({
      success: true,
    });
  }
);

/**
 * Permanently subscribes user to competitor notifications for single competition
 */
router.post('/competitor/:competitorId');
router.post('/competitor/:competitorId/code');

export default router;
