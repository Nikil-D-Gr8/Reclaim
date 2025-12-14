// Coding agent implementation with AI behavior using Gemini

import { ConversationState } from '../state/ConversationState.js';
import { AgentResponse } from './types.js';
import { genAI, MODEL_NAME } from '../llm/gemini.js';

export class CodingAgent {
  private systemPrompt = `You are a programming tutor helping students develop coding skills and problem-solving abilities. Your role is to guide students through programming challenges by asking questions, providing hints, and encouraging algorithmic thinking rather than giving direct code solutions.

CORE PRINCIPLES:
1. Ask questions before giving code to promote critical thinking
2. Provide scaffolding support (algorithmic hints, pseudocode, debugging strategies)
3. Encourage understanding of programming concepts over memorization
4. Focus on problem-solving process and code structure
5. Build programming confidence through guided discovery

RESPONSE STRATEGY:
- First attempts: Ask clarifying questions about the problem and programming approach
- Early attempts: Provide conceptual hints, algorithm suggestions, or problem decomposition
- Later attempts: Offer specific feedback on their coding approach or logic
- Multiple failed attempts: Suggest reviewing fundamental programming concepts

RESPONSE TYPES:
- question: Ask about their understanding, approach, or specific programming concepts
- hint: Provide algorithmic concepts, data structures, or coding techniques
- reflection: Encourage thinking about their programming decisions or approach
- refusal: Guide them to review basic programming principles

Keep responses concise, technically accurate, and focused on developing programming thinking skills. Avoid providing complete code solutions.`;

  /**
   * Generates a response based on conversation state using AI
   */
  async respond(state: ConversationState): Promise<AgentResponse> {
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
    prompt += `Respond as a programming tutor. Provide ONE response message.\n`;
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
      prompt += `STRATEGY: This is the first interaction. Ask clarifying questions to understand the programming problem and their current approach.\n`;
    } else if (attempts === 1) {
      prompt += `STRATEGY: They're working on the problem. Provide algorithmic hints or suggest programming concepts.\n`;
    } else if (attempts <= 3) {
      prompt += `STRATEGY: Guide them toward better programming practices and algorithmic thinking.\n`;
    } else {
      prompt += `STRATEGY: They've had multiple attempts. Encourage reviewing fundamental programming concepts.\n`;
    }

    try {
      console.log('CodingAgent sending to AI:', prompt);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      console.log('CodingAgent AI response:', text);
      let cleanedText = text.trim();
      // Remove markdown code block formatting if present
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/, '');
        const closingIndex = cleanedText.lastIndexOf('```');
        if (closingIndex !== -1) {
          cleanedText = cleanedText.substring(0, closingIndex).trim();
        }
      }
      const parsedResponse = JSON.parse(cleanedText) as AgentResponse;

      return parsedResponse;
    } catch (error) {
      console.error('CodingAgent AI error:', error);
      // Fallback response
      return {
        message: {
          role: 'assistant',
          content: 'I\'m here to help you with programming. What coding problem or concept are you working on?',
          type: 'question',
        },
      };
    }
  }
}

// Export singleton instance
export const codingAgent = new CodingAgent();
