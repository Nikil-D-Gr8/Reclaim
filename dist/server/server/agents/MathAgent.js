// Math agent implementation with AI behavior using Gemini
import { genAI, MODEL_NAME } from '../llm/gemini.js';
export class MathAgent {
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
        prompt += `Return ONLY valid JSON with this exact structure, no additional text, markdown, or formatting:\n`;
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
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            // Prepare chat history for Gemini
            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));
            console.log('MathAgent sending to AI - history:', history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n'));
            console.log('MathAgent sending to AI - prompt:', prompt);
            // Create chat session with history
            const chat = model.startChat({
                history,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
            });
            // Send the current prompt as the new message
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();
            // Parse the JSON response
            console.log('MathAgent AI response:', text);
            let cleanedText = text.trim();
            // Remove markdown code block formatting if present
            if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```(?:json)?\s*/, '');
                const closingIndex = cleanedText.lastIndexOf('```');
                if (closingIndex !== -1) {
                    cleanedText = cleanedText.substring(0, closingIndex).trim();
                }
            }
            const parsedResponse = JSON.parse(cleanedText);
            return parsedResponse;
        }
        catch (error) {
            console.error('MathAgent AI error:', error);
            // Fallback response that acknowledges conversation history
            let fallbackContent = 'I\'m here to help you with mathematics. What mathematical problem or concept are you working on?';
            if (attempts > 0) {
                fallbackContent = 'I see you\'re continuing our math discussion. Could you tell me more about what you\'re working on or what help you need?';
            }
            return {
                message: {
                    role: 'assistant',
                    content: fallbackContent,
                    type: 'question',
                },
            };
        }
    }
}
// Export singleton instance
export const mathAgent = new MathAgent();
