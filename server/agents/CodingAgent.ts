// Coding agent implementation with rule-based behavior
// TODO: Replace stub logic with actual AI behavior using Gemini

import { ConversationState } from '../state/ConversationState';
import { AgentResponse } from './types';

export class CodingAgent {
  /**
   * Generates a response based on conversation state
   * Currently uses simple rules based on attempt count
   */
  respond(state: ConversationState): AgentResponse {
    const attempts = state.attempts;

    if (attempts === 0) {
      // First attempt: Ask clarifying question
      return {
        message: {
          role: 'assistant',
          content: 'Can you tell me more about what you\'re trying to build or solve?',
          type: 'question',
        },
      };
    }

    if (attempts === 1) {
      // Second attempt: Provide generic hint
      return {
        message: {
          role: 'assistant',
          content: 'Consider breaking down the problem into smaller steps. What\'s the first thing you need to do?',
          type: 'hint',
        },
      };
    }

    // Third+ attempts: Refusal with guidance
    return {
      message: {
        role: 'assistant',
        content: 'It looks like you might need to take a step back and review the fundamentals. Try looking up the basic concepts first.',
        type: 'refusal',
      },
    };
  }
}

// Export singleton instance
export const codingAgent = new CodingAgent();
