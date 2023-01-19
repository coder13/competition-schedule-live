import { Request, Router } from 'express';
import { getUserCompetitionSubscriptions } from '../../../controllers/userSubscriptions';
import { getUser } from '../../../middlewares/user';
import { CompetitionSubscription } from '../../../prisma/generated/client';
import auth from './auth';
import subscriptions from './subscriptions';

const router = Router();

router.use('/auth', auth);
router.use('/subscriptions', subscriptions);

router.get('/me', getUser, async (req: Request, res) => {
  if (!req.user) {
    res.status(401).json({ success: false });
    return;
  }

  const compSubs = await getUserCompetitionSubscriptions(req.user.id);
  const T: Record<
    string,
    Array<Pick<CompetitionSubscription, 'type' | 'value'>>
  > = {};

  res.json({
    success: true,
    user: {
      ...req.user,
      competitionSubscriptions: compSubs.reduce((acc = {}, sub) => {
        return {
          ...acc,
          [sub.competitionId]: [
            ...(acc[sub.competitionId] || []),
            {
              type: sub.type,
              value: sub.value,
            },
          ],
        };
      }, T),
    },
  });
});

export default router;
