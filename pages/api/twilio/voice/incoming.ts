import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTemplateMessage } from '@/lib/twilio';

// Twilio sends application/x-www-form-urlencoded; Next may not parse it by default.
// We read both body and query to be resilient.

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};

function getField(req: NextApiRequest, key: string): string | undefined {
  const bodyVal = (req.body && (req.body as any)[key]) as string | undefined;
  const queryVal = (req.query && req.query[key]) as string | undefined;
  return bodyVal || queryVal;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const from = getField(req, 'From');
  const to = getField(req, 'To');

  // Fire-and-forget SMS to caller to acknowledge incoming call
  if (from) {
    try {
      await sendTemplateMessage(from, 'incoming', { caller: from });
    } catch {
      // swallow errors to not affect TwiML response
    }
  }

  // Respond with basic TwiML to keep call alive or say a message
  res.setHeader('Content-Type', 'text/xml');
  const message = 'Thanks for calling. We have sent you a confirmation by SMS.';
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response><Say voice="polly.Matthew">${message}</Say><Pause length="1"/><Hangup/></Response>`;
  res.status(200).send(twiml);
}
