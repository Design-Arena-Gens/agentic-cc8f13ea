import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Fallback if no messaging service

function assertEnv() {
  if (!accountSid || !authToken) {
    throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
  }
  if (!messagingServiceSid && !fromNumber) {
    throw new Error('Provide TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER');
  }
}

export const twilioClient = () => {
  assertEnv();
  return Twilio(accountSid!, authToken!);
};

export type TemplateKey = 'incoming' | 'outgoing' | 'missed';

export function renderTemplate(key: TemplateKey, context: { caller?: string; callee?: string; brand?: string } = {}) {
  const brand = context.brand || 'Our Team';
  const caller = context.caller || 'your number';
  const callee = context.callee || 'you';

  switch (key) {
    case 'incoming':
      return `Heads up! We just received a call from ${caller}. If we missed you, we?ll call back shortly. - ${brand}`;
    case 'outgoing':
      return `We?re calling ${caller} now. Please keep your phone handy. - ${brand}`;
    case 'missed':
      return `We missed your call from ${caller}. Reply here and we?ll get back ASAP. - ${brand}`;
    default:
      return `Notification from ${brand}.`;
  }
}

export async function sendTemplateMessage(to: string, key: TemplateKey, context: { caller?: string; callee?: string; brand?: string } = {}) {
  const client = twilioClient();
  const body = renderTemplate(key, context);
  return client.messages.create({
    to,
    body,
    ...(messagingServiceSid ? { messagingServiceSid } : { from: fromNumber! })
  });
}
