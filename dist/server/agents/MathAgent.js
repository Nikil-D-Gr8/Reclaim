"use strict";
// Math agent implementation with AI behavior using Gemini
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathAgent = exports.MathAgent = void 0;
const gemini_1 = require("../llm/gemini");
class MathAgent {
    constructor() {
        this.systemPrompt = `You are a mathematics tutor helping students develop problem-solving skills and mathematical understanding. Your role is to guide students through mathematical reasoning by asking questions, providing hints, and encouraging conceptual understanding rather than giving direct answers.

CORE PRINCIPLES:
1. Ask questions before giving answers to promote critical thinking
2. Provide scaffolding support (hints, partial solutions, analogous problems)
3. Encourage conceptual understanding over memorization
4. Focus on problem-solving process and mathematical reasoning
5. Build mathematical confidence through guided discovery

RESPONSE STRATEGY:
- First attempts: Ask clarifying questions about the problem and their approach
- Early attempts: Provide conceptual hints, related concepts, or problem-solving strategies
- Later attempts: Offer specific feedback on their mathematical reasoning
- Multiple failed attempts: Suggest reviewing fundamental mathematical concepts

RESPONSE TYPES:
- question: Ask about their understanding, approach, or specific mathematical concepts
- hint: Provide mathematical concepts, formulas, or problem-solving techniques
- reflection: Encourage thinking about their mathematical reasoning or approach
- refusal: Guide them to review basic mathematical principles

Keep responses concise, mathematically accurate, and focused on developing mathematical thinking skills. Use proper mathematical notation when appropriate.`;
    }
    /**
     * Generates a response based on conversation state using AI
     */
    async respond(state) {
        const attempts = state.attempts;
        const messages = state.messages;
        const phase = state.phase;
        // Build context from conversation history
        const conversationContext = messages
            .slice(-10) // Last 10 messages for context
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');
        // Create prompt based on attempt count and phase
        let prompt = `${this.systemPrompt}\n\n`;
        prompt += `CONVERSATION CONTEXT:\n${conversationContext}\n\n`;
        prompt += `CURRENT STATE:\n`;
        prompt += `- Attempts: ${attempts}\n`;
        prompt += `- Phase: ${phase}\n`;
        prompt += `- Last intent: ${state.lastIntent || 'unknown'}\n\n`;
        prompt += `INSTRUCTIONS:\n`;
        prompt += `Respond as a mathematics tutor. Provide ONE response message.\n`;
        prompt += `Format your response as JSON with this exact structure:\n`;
        prompt += `{\n`;
        prompt += `  "message": {\n`;
        prompt += `    "role": "assistant",\n`;
        prompt += `    "content": "your response here",\n`;
        prompt += `    "type": "question|hint|reflection|refusal"\n`;
        prompt += `  },\n`;
        prompt += `  "stateUpdate": {} // optional state modifications\n`;
        prompt += `}\n\n`;
        // Strategy based on attempts
        if (attempts === 0) {
            prompt += `STRATEGY: This is the first interaction. Ask clarifying questions to understand the mathematical problem and their current understanding.\n`;
        }
        else if (attempts === 1) {
            prompt += `STRATEGY: They're working on the problem. Provide conceptual hints or suggest related mathematical concepts.\n`;
        }
        else if (attempts <= 3) {
            prompt += `STRATEGY: Guide them toward better mathematical reasoning and problem-solving strategies.\n`;
        }
        else {
            prompt += `STRATEGY: They've had multiple attempts. Encourage reviewing fundamental mathematical concepts.\n`;
        }
        try {
            const model = gemini_1.genAI.getGenerativeModel({ model: gemini_1.MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Parse the JSON response
            const parsedResponse = JSON.parse(text.trim());
            return parsedResponse;
        }
        catch (error) {
            console.error('MathAgent AI error:', error);
            // Fallback response
            return {
                message: {
                    role: 'assistant',
                    content: 'I\'m here to help you with mathematics. What mathematical problem or concept are you working on?',
                    type: 'question',
                },
            };
        }
    }
}
exports.MathAgent = MathAgent;
// Export singleton instance
exports.mathAgent = new MathAgent();
