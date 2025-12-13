// Gemini LLM client setup

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

// Load environment variables
config();

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export const MODEL_NAME = process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro';

// TODO: Implement actual Gemini calls when ready
// Example usage (not implemented yet):
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
// const result = await model.generateContent(prompt);
// const response = await result.response;
// const text = response.text();
