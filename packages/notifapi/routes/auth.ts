import { Request, Router } from 'express';
import twilio from 'twilio';
import prisma from '../db';
import { genCode } from '../lib/utils';
import { getUser } from '../middlewares/user';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
console.log('twilio', { accountSid, authToken });
const twilioClient = twilio(accountSid, authToken);
const authRouter = Router();

authRouter.get('/test', getUser, (req: Request, res) => {
  if (!req.user) {
    res.status(401).json({ success: false });
    return;
  }

  res.json({ success: true, user: req.user });
});

/**
 * POST /auth/number
 * Body: { number: string }
 */
authRouter.post('/number', async (req, res) => {
  const { number } = req.body;

  try {
    const code = genCode();
    req.session.auth = {
      number: {
        number,
        code,
        expires: Date.now() + 1000 * 60 * 15, // 15 minutes
      },
    };
    req.session.save();

    await twilioClient.messages.create({
      body: `Your CompNotify code is ${code}. This code expires in 15 minutes. Don't share this code with anyone.`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: number,
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
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
    console.error(e);
    res.status(500).json({ success: false, message: (e as Error).message });
  }
});

export default authRouter;
