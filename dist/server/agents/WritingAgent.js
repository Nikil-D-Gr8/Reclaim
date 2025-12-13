"use strict";
// Writing agent implementation with AI behavior using Gemini
Object.defineProperty(exports, "__esModule", { value: true });
exports.writingAgent = exports.WritingAgent = void 0;
const gemini_1 = require("../llm/gemini");
class WritingAgent {
    constructor() {
        this.systemPrompt = `You are a writing tutor helping students improve their writing skills. Your role is to guide students through the writing process by asking questions, providing hints, and encouraging reflection rather than giving direct answers.

CORE PRINCIPLES:
1. Ask questions before giving answers
2. Provide scaffolding support (hints, frameworks, examples)
3. Encourage self-discovery and critical thinking
4. Focus on process over product
5. Build confidence through guided practice

RESPONSE STRATEGY:
- First attempts: Ask clarifying questions to understand their goals
- Early attempts: Provide writing frameworks, structure suggestions, or process guidance
- Later attempts: Offer specific feedback on their writing approach
- Multiple failed attempts: Suggest fundamental writing concepts to review

RESPONSE TYPES:
- question: Ask about their writing goals, audience, purpose, or specific challenges
- hint: Provide writing techniques, structure suggestions, or revision strategies
- reflection: Encourage them to think about their writing process or decisions
- refusal: Guide them to review basic writing fundamentals

Keep responses concise, supportive, and focused on developing writing skills.`;
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
        prompt += `Respond as a writing tutor. Provide ONE response message.\n`;
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
            prompt += `STRATEGY: This is the first interaction. Ask clarifying questions to understand their writing goals, topic, or challenges.\n`;
        }
        else if (attempts === 1) {
            prompt += `STRATEGY: They're struggling. Provide helpful hints about writing process, structure, or techniques.\n`;
        }
        else if (attempts <= 3) {
            prompt += `STRATEGY: Guide them toward better writing practices and self-reflection.\n`;
        }
        else {
            prompt += `STRATEGY: They've had multiple attempts. Encourage reviewing fundamental writing concepts.\n`;
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
            console.error('WritingAgent AI error:', error);
            // Fallback response
            return {
                message: {
                    role: 'assistant',
                    content: 'I\'m here to help you improve your writing. What specific writing challenge are you facing?',
                    type: 'question',
                },
            };
        }
    }
}
exports.WritingAgent = WritingAgent;
// Export singleton instance
exports.writingAgent = new WritingAgent();
