import type { NextApiRequest, NextApiResponse } from 'next';
import { twilioClient } from '@/lib/twilio';

function getBaseUrl(req: NextApiRequest) {
  const envBase = process.env.PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Missing to' });

  const client = twilioClient();
  const baseUrl = getBaseUrl(req);
  const answerUrl = `${baseUrl}/api/twilio/voice/answer?to=${encodeURIComponent(to)}`;
  const statusUrl = `${baseUrl}/api/twilio/voice/status`;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) return res.status(400).json({ error: 'TWILIO_PHONE_NUMBER is required for outbound calls' });

  try {
    const call = await client.calls.create({
      to,
      from,
      url: answerUrl,
      statusCallback: statusUrl,
      statusCallbackMethod: 'POST',
      machineDetection: 'DetectMessageEnd'
    });
    res.status(200).json({ sid: call.sid });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
