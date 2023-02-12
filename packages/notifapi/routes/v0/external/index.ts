import { Router } from 'express';
import cors from 'cors';
import notifyRouter from './notify';
import admin from './admin';
import prisma from '../../../db';

const router = Router();

router.use(
  cors<cors.CorsRequest>({
    origin: '*',
  })
);

router.use('/admin', admin);

router.use(
  '/competitions/:competitionId/subscribedUsersCount',
  async (req, res) => {
    try {
      const count = await prisma.competitionSubscription.findMany({
        select: {
          userId: true,
        },
        distinct: ['userId'],
        where: {
          competitionId: {
            equals: req.params.competitionId,
            mode: 'insensitive',
          },
        },
      });

      res.json({ success: true, count: count.length });
    } catch (e) {
      res.status(500).json({ success: false, error: (e as Error)?.message });
    }
  }
);

router.use('/competitions/:competitionId/subscribedUsers', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
      where: {
        CompetitionSubscription: {
          some: {
            competitionId: {
              equals: req.params.competitionId,
              mode: 'insensitive',
            },
          },
        },
      },
    });

    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error)?.message });
  }
});

router.use(notifyRouter);

export default router;
