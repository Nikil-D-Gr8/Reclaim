import { sessionStore } from '../../dist/server/state/SessionStore.js';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { sessionId, mode } = req.body;
    if (!sessionId || !mode) {
        return res.status(400).json({ error: 'Session ID and mode are required' });
    }
    try {
        // Fetch session state
        const session = await sessionStore.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        if (session.status === 'summarizing' || session.status === 'completed') {
            return res.status(400).json({ error: 'Session already ended or processing' });
        }
        // Flatten messages into plain text string
        const conversation = session.messages
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
        // Generate a unique execution ID for Kestra
        const kestraExecutionId = `exec_${sessionId}_${Date.now()}`;
        // Update session status to summarizing
        await sessionStore.updateSession(sessionId, {
            status: 'summarizing',
            kestraExecutionId,
        });
        // Trigger Kestra webhook
        const kestraUrl = 'http://localhost:8080/api/v1/executions/webhook/company.team/session_summary_simple/session-summary-simple';
        try {
            const kestraResponse = await fetch(kestraUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation }),
            });
            if (!kestraResponse.ok) {
                console.error('Kestra webhook failed:', kestraResponse.status, kestraResponse.statusText);
                // Reset session status on failure
                await sessionStore.updateSession(sessionId, { status: 'active' });
                return res.status(500).json({ error: 'Failed to trigger Kestra workflow' });
            }
            console.log('Kestra workflow triggered successfully for session:', sessionId);
        }
        catch (kestraError) {
            console.error('Error calling Kestra:', kestraError);
            // Reset session status on failure
            await sessionStore.updateSession(sessionId, { status: 'active' });
            return res.status(500).json({ error: 'Failed to connect to Kestra' });
        }
        const response = {
            success: true,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
