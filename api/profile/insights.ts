import { VercelRequest, VercelResponse } from '@vercel/node';
import { insightsStore } from '../../dist/server/server/state/InsightsStore.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all subject metrics
    const subjectMetrics = await insightsStore.getAllSubjectMetrics();

    // Get recent patterns
    const recentPatterns = await insightsStore.getRecentPatterns(20);

    // Create overall summary from aggregated data
    const writingSummary = (subjectMetrics as any).writing?.aggregatedSummary;
    const codingSummary = (subjectMetrics as any).coding?.aggregatedSummary;
    const mathSummary = (subjectMetrics as any).math?.aggregatedSummary;

    const availableSummaries = [
      writingSummary && `Writing: ${writingSummary}`,
      codingSummary && `Coding: ${codingSummary}`,
      mathSummary && `Math: ${mathSummary}`,
    ].filter(Boolean);

    let overallSummary = 'Learning insights aggregated from recent sessions';

    if (availableSummaries.length > 0) {
      if (availableSummaries.length === 1) {
        // Only one subject - use it directly
        overallSummary = availableSummaries[0];
      } else {
        // Multiple subjects - concatenate summaries
        overallSummary = `Combined Learning Insights:\n\n${availableSummaries.join('\n\n')}`;
      }
    }

    // Format response to match ProfileSummary interface
    const response = {
      overallSummary,
      perMode: {
        writing: writingSummary || undefined,
        coding: codingSummary || undefined,
        math: mathSummary || undefined,
      },
      lastUpdated: Date.now(),
      recentPatterns,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching profile insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
