import { Router } from 'express';
import twilio from 'twilio';
import { genCode } from './lib/utils';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;
console.log('twilio', { accountSid, authToken });
const twilioClient = twilio(accountSid, authToken);
const router = Router();

/**
 * POST /auth/number
 * Body: { number: string }
 */
router.post('/auth/number', async (req, res) => {
  const { number } = req.body;

  try {
    const code = genCode();

    await twilioClient.messages.create({
      body: `Your CompNotify code is ${code}. Don't share this code with anyone.`,
      from: '+15092851485',
      to: number,
    });

    res.status(200).json({ success: true, message: 'Code sent' }).end();
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: (e as Error).message })
      .end();
  }
});

router.post('/auth/number/code');
router.post('/subscribe/competitionId/:competitionId');
router.post('/subscribe/competitor/:competitorId/code');

export default router;
