import { VercelRequest, VercelResponse } from '@vercel/node';
import { sessionStore } from '../../dist/server/state/SessionStore.js';
import { insightsStore } from '../../dist/server/state/InsightsStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Fetch session state
    const session = await sessionStore.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.kestraExecutionId) {
      return res.status(400).json({ error: 'Session has no Kestra execution ID' });
    }

    if (session.status !== 'summarizing') {
      return res.status(400).json({ error: 'Session is not in summarizing state' });
    }

    // Poll Kestra for execution status
    const kestraBaseUrl = 'http://localhost:8080';
    const executionUrl = `${kestraBaseUrl}/api/v1/executions/company.team/session_summary_simple/${session.kestraExecutionId}`;

    try {
      const executionResponse = await fetch(executionUrl);
      if (!executionResponse.ok) {
        return res.status(200).json({ status: 'processing' }); // Still processing
      }

      const executionData = await executionResponse.json() as any;

      if (executionData.state?.current !== 'SUCCESS') {
        return res.status(200).json({ status: 'processing' }); // Still processing
      }

      // Get execution logs to extract Gemini output
      const logsUrl = `${kestraBaseUrl}/api/v1/executions/company.team/session_summary_simple/${session.kestraExecutionId}/logs`;
      const logsResponse = await fetch(logsUrl);

      if (!logsResponse.ok) {
        console.error('Failed to fetch Kestra logs');
        return res.status(500).json({ error: 'Failed to fetch execution logs' });
      }

      const logsData = await logsResponse.json() as any;

      // Parse logs to extract Gemini response
      // This is a simplified parsing - in reality, you'd need to parse the actual log structure
      let patternsObserved = '';
      let strengths = '';
      let weaknesses = '';

      // Look for the Gemini output in logs (simplified extraction)
      const logContent = logsData.logs?.map((log: any) => log.message).join('\n') || '';

      // Extract sections from the log content
      const patternsMatch = logContent.match(/Patterns Observed:\s*([^\n]+)/i);
      const strengthsMatch = logContent.match(/Strengths:\s*([^\n]+)/i);
      const weaknessesMatch = logContent.match(/Weaknesses:\s*([^\n]+)/i);

      if (patternsMatch) patternsObserved = patternsMatch[1].trim();
      if (strengthsMatch) strengths = strengthsMatch[1].trim();
      if (weaknessesMatch) weaknesses = weaknessesMatch[1].trim();

      // If we couldn't parse the logs, use default values
      if (!patternsObserved || !strengths || !weaknesses) {
        console.warn('Could not parse Gemini output from logs, using defaults');
        patternsObserved = patternsObserved || 'Learning patterns observed during the session';
        strengths = strengths || 'Various strengths demonstrated';
        weaknesses = weaknesses || 'Areas identified for improvement';
      }

      // Create session summary
      const sessionSummary = {
        sessionId,
        mode: session.mode,
        patternsObserved,
        strengths,
        weaknesses,
        createdAt: Date.now(),
      };

      // Save to insights store
      await insightsStore.saveSessionSummary(sessionSummary);

      // Update session status to completed
      await sessionStore.updateSession(sessionId, { status: 'completed' });

      res.status(200).json({
        status: 'completed',
        sessionSummary,
      });

    } catch (kestraError) {
      console.error('Error polling Kestra:', kestraError);
      res.status(200).json({ status: 'processing' }); // Assume still processing on error
    }

  } catch (error) {
    console.error('Error processing Kestra results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
