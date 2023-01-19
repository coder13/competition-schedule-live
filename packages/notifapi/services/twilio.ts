import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;

if (!accountSid && !authToken) {
  console.error('Missing twilio credentials!');
}

export const twilioClient = twilio(accountSid, authToken);

export const sendMessage = async ({ to, body }: { to: string; body: string }) =>
  twilioClient.messages.create({
    from: process.env.TWILIO_FROM_NUMBER,
    to,
    body,
  });
