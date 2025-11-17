import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTemplateMessage } from '@/lib/twilio';

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
  const callStatus = getField(req, 'CallStatus');
  const to = getField(req, 'To');
  const from = getField(req, 'From');

  try {
    if (callStatus === 'ringing' || callStatus === 'queued' || callStatus === 'initiated') {
      if (to) await sendTemplateMessage(to, 'outgoing', { caller: to });
    }
    if (callStatus === 'no-answer' || callStatus === 'busy' || callStatus === 'failed' || callStatus === 'canceled') {
      // Message the caller that we missed their call
      if (to) await sendTemplateMessage(to, 'missed', { caller: to });
    }
  } catch {
    // ignore errors
  }

  res.status(200).json({ ok: true });
}
