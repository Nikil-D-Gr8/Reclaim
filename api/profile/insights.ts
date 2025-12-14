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
        // Multiple subjects - use AI to create combined summary
        try {
          const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
          console.log('🔑 GOOGLE_GEMINI_API_KEY available:', !!apiKey);

          if (!apiKey) {
            console.error('❌ GOOGLE_GEMINI_API_KEY not found in environment variables');
            throw new Error('GOOGLE_GEMINI_API_KEY not configured');
          }

          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

          const prompt = `You are an educational insights aggregator. Combine these learning summaries from different subjects into a cohesive overall learning profile. Focus on common patterns, strengths, and areas for improvement across subjects.

Available learning insights:
${availableSummaries.join('\n\n')}

Create a concise summary that identifies:
1. Overall learning patterns and approaches
2. Key strengths demonstrated across subjects
3. Common challenges or areas needing attention

Keep the summary concise and insightful, around 100 words.`;

          const result = await model.generateContent(prompt);
          const aiSummary = result.response.text();
          overallSummary = `AI-Generated Overall Learning Summary:\n\n${aiSummary}`;
        } catch (aiError) {
          console.error('Failed to generate AI summary:', aiError);
          // Fallback to simple concatenation
          overallSummary = `Combined Learning Insights:\n\n${availableSummaries.join('\n\n')}`;
        }
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
