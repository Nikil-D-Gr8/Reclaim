import { VercelRequest, VercelResponse } from '@vercel/node';
import { GetProfileSummaryResponse } from '../../src/types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Placeholder profile summary
  // In a real implementation, Kestra would populate this data based on user interactions
  const response: GetProfileSummaryResponse = {
    overallSummary: undefined,
    summaries: {
      writing: undefined,
      coding: undefined,
      math: undefined,
    },
    lastUpdated: Date.now(),
  };

  res.status(200).json(response);
}
