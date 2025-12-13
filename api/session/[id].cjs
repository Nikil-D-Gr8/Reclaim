import { VercelRequest, VercelResponse } from '@vercel/node';
import { GetSessionResponse, Session } from '../../src/types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Placeholder session object
  // In a real implementation, this would fetch from a database
  const session: Session = {
    id,
    mode: 'writing', // default mode
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const response: GetSessionResponse = {
    session,
  };

  res.status(200).json(response);
}
