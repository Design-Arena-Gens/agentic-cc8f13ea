import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTemplateMessage, TemplateKey } from '@/lib/twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, templateKey, caller, callee, brand } = req.body || {};
  if (!to || !templateKey) return res.status(400).json({ error: 'Missing to or templateKey' });

  try {
    const r = await sendTemplateMessage(to, templateKey as TemplateKey, { caller, callee, brand });
    res.status(200).json({ sid: r.sid });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
