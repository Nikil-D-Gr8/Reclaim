import { VercelRequest, VercelResponse } from '@vercel/node';
import { sessionStore } from '../../dist/server/state/SessionStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all active sessions and filter for those in summarizing state
    const activeSessions = await sessionStore.getActiveSessions();
    const summarizingSessions = [];

    for (const sessionId of activeSessions) {
      const session = await sessionStore.getSession(sessionId);
      if (session && session.status === 'summarizing') {
        summarizingSessions.push({
          sessionId,
          mode: session.mode,
          kestraExecutionId: session.kestraExecutionId,
        });
      }
    }

    res.status(200).json({ sessions: summarizingSessions });
  } catch (error) {
    console.error('Error fetching summarizing sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
