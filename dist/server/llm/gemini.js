"use strict";
// Gemini LLM client setup
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_NAME = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
}
exports.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
exports.MODEL_NAME = process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro';
// TODO: Implement actual Gemini calls when ready
// Example usage (not implemented yet):
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
// const result = await model.generateContent(prompt);
// const response = await result.response;
// const text = response.text();
