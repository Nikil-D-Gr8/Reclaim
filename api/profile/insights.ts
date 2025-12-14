import { VercelRequest, VercelResponse } from '@vercel/node';
import { insightsStore } from '../../dist/server/state/InsightsStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all subject metrics
    const subjectMetrics = await insightsStore.getAllSubjectMetrics();

    // Get recent patterns
    const recentPatterns = await insightsStore.getRecentPatterns(20);

    // Format response to match ProfileSummary interface
    const response = {
      overallSummary: 'Learning insights aggregated from recent sessions',
      perMode: {
        writing: subjectMetrics.writing?.aggregatedSummary || undefined,
        coding: subjectMetrics.coding?.aggregatedSummary || undefined,
        math: subjectMetrics.math?.aggregatedSummary || undefined,
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
