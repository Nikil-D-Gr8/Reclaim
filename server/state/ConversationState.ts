// Conversation state model for tracking conversation history and agent reasoning

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export type Intent =
  | "ask_solution"
  | "ask_hint"
  | "explain_attempt"
  | "clarify_concept";

export type Phase =
  | "exploration"
  | "struggling"
  | "progressing"
  | "ready";

export interface ConversationState {
  sessionId: string;
  mode: "coding" | "math" | "writing";
  messages: Message[]; // Bounded array, max ~20 messages
  attempts: number;
  lastIntent?: Intent;
  phase: Phase;
  summary?: string; // Optional, future Kestra output
  status?: 'active' | 'summarizing' | 'completed';
  kestraExecutionId?: string;
}

/**
 * Infers the user's intent from their message content
 * TODO: Implement real intent detection logic
 */
export function inferIntentFromMessage(content: string): Intent {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("solution") || lowerContent.includes("answer")) {
    return "ask_solution";
  }
  if (lowerContent.includes("hint") || lowerContent.includes("help")) {
    return "ask_hint";
  }
  if (lowerContent.includes("tried") || lowerContent.includes("attempt")) {
    return "explain_attempt";
  }
  return "clarify_concept"; // Default
}

/**
 * Updates the learning phase based on number of attempts
 * TODO: Implement more sophisticated phase detection
 */
export function updatePhase(attempts: number): Phase {
  if (attempts === 0) return "exploration";
  if (attempts === 1) return "struggling";
  if (attempts <= 3) return "progressing";
  return "ready";
}
