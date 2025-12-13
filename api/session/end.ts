import { VercelRequest, VercelResponse } from '@vercel/node';
import { EndSessionRequest, EndSessionResponse } from '../../src/types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, mode }: EndSessionRequest = req.body;

  if (!sessionId || !mode) {
    return res.status(400).json({ error: 'Session ID and mode are required' });
  }

  // TODO: In the future, trigger Kestra workflow here to process session data

  const response: EndSessionResponse = {
    success: true,
  };

  res.status(200).json(response);
}
