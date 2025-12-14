import { VercelRequest, VercelResponse } from '@vercel/node';
import { sessionStore } from '../../dist/server/server/state/SessionStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all active session IDs
    const sessionIds = await sessionStore.getActiveSessions();
    const sessions = [];

    // Load each session
    for (const sessionId of sessionIds) {
      const session = await sessionStore.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    res.status(200).json({ sessions });
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
