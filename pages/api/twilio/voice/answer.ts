import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const to = (req.query['to'] as string) || '';
  const safe = to.replace(/[^+0-9]/g, '');
  res.setHeader('Content-Type', 'text/xml');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice=\"polly.Matthew\">Please hold while we connect your call.</Say>\n  <Dial><Number>${safe}</Number></Dial>\n</Response>`;
  res.status(200).send(twiml);
}
