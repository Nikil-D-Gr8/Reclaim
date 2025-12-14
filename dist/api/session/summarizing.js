import { sessionStore } from '../../dist/server/server/state/SessionStore.js';
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        // Get sessions that are currently in summarizing state
        const summarizingSessionIds = await sessionStore.getSessionsByStatus('summarizing');
        const summarizingSessions = [];
        for (const sessionId of summarizingSessionIds) {
            const session = await sessionStore.getSession(sessionId);
            if (session) {
                summarizingSessions.push({
                    sessionId,
                    mode: session.mode,
                    kestraExecutionId: session.kestraExecutionId,
                });
            }
        }
        res.status(200).json({ sessions: summarizingSessions });
    }
    catch (error) {
        console.error('Error fetching summarizing sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
