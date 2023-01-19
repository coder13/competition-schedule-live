import { Router } from 'express';
import { body } from 'express-validator';
import prisma from '../../../db';

const router = Router();

/**
 * /v0/external/admin/messagingService/:competitionId
 * configures a messaging service for a competition
 */
router.get('/messagingService/:competitionId', async (req, res) => {
  const sid = await prisma.competitionSid.findFirst({
    where: {
      competitionId: req.params.competitionId,
    },
  });

  res.json({ success: true, sid });
});

/**
 * /v0/external/admin/messagingService/:competitionId
 * body: {
 *  sid: string
 * }
 * configures a messaging service for a competition
 */
router.put(
  '/messagingService/:competitionId',
  body('sid').isString(),
  async (req, res) => {
    if (!req.params?.competitionId) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid competition id' });
      return;
    }

    console.log(39, req.body);

    try {
      res.json({
        success: true,
        res: await prisma.competitionSid.upsert({
          where: {
            competitionId: req.params.competitionId,
          },
          update: {
            sid: req.body.sid,
          },
          create: {
            competitionId: req.params.competitionId,
            sid: req.body.sid,
          },
        }),
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        success: false,
        message: 'Error occured while updating competition messaging service',
      });
    }
  }
);

export default router;
