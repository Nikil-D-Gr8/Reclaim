import { VercelRequest, VercelResponse } from '@vercel/node';
import { StartSessionRequest, StartSessionResponse } from '../../src/types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode }: StartSessionRequest = req.body;

  if (!mode) {
    return res.status(400).json({ error: 'Mode is required' });
  }

  // Generate a unique session ID
  const sessionId = crypto.randomUUID();
  const createdAt = Date.now();

  const response: StartSessionResponse = {
    sessionId,
    mode,
    createdAt,
  };

  res.status(200).json(response);
}
