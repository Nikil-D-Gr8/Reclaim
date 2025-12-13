// Gemini LLM client setup
// TODO: Replace DUMMY_API_KEY with real environment variable

import { GoogleGenerativeAI } from '@google/generative-ai';

// DUMMY API KEY - Replace with process.env.GOOGLE_GEMINI_API_KEY
const DUMMY_API_KEY = 'dummy-api-key-for-development-only';

export const genAI = new GoogleGenerativeAI(DUMMY_API_KEY);

// TODO: Implement actual Gemini calls when ready
// Example usage (not implemented yet):
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
// const result = await model.generateContent(prompt);
// const response = await result.response;
// const text = response.text();
