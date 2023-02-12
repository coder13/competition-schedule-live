import { Request, Router } from 'express';
import { SessionData } from 'express-session';
import { sendMessage } from '../../../services/twilio';
import prisma from '../../../db';
import { genCode } from '../../../lib/utils';
import logger from '../../../lib/logger';

const authRouter = Router();

authRouter.get('/session', (req: Request, res) => {
  if (req.session) {
    res.json({
      success: true,
      session: req.session.auth?.number && {
        number: req.session.auth.number.number,
        codeSent: !!req.session.auth.number.code,
      },
    });
  } else {
    res.status(500).json({ success: false, message: 'No session found' });
  }
});

/**
 * POST /auth/number
 * Body: { number: string }
 */
authRouter.post('/number', async (req, res) => {
  const { number } = req.body;

  const session = req.session as SessionData;
  try {
    const code = genCode();
    session.auth = {
      number: {
        number,
        code,
        expires: Date.now() + 1000 * 60 * 15, // 15 minutes
      },
    };
    // session.save();

    await sendMessage({
      to: number,
      body: `Your NotifyComp code is ${code}. This code expires in 15 minutes. Don't share this code with anyone.`,
    });

    res.json({ success: true });
  } catch (e) {
    logger.error(e);
    res.status(500).json({ success: false, message: (e as Error).message });
  }
});

authRouter.post('/number/code', async (req, res) => {
  if (!req.session.auth?.number) {
    res
      .status(400)
      .json({ success: false, message: 'No code found in user session' });
    return;
  }

  console.log(req.session, req.body);
  const { code } = req.body;
  if (code !== req.session.auth.number.code) {
    res.status(400).json({ success: false, message: 'Invalid code' });
    return;
  }

  if (Date.now() > req.session.auth.number.expires) {
    res.status(400).json({ success: false, message: 'Code expired' });
    return;
  }

  const phoneNumber = req.session.auth.number.number;

  try {
    const user = await prisma.user.upsert({
      where: {
        phoneNumber,
      },
      update: {
        phoneNumber,
      },
      create: {
        phoneNumber,
      },
    });

    req.session.userId = user.id;
    req.session.auth.number.verified = true;

    res.json({ success: true, user });
  } catch (e) {
    logger.error(e);
    res.status(500).json({ success: false, message: (e as Error).message });
  }
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error(err);
      res.status(500).json({ success: false, message: (err as Error).message });
      return;
    }

    res.json({ success: true });
  });
});

export default authRouter;
