// Agent response types and interfaces

import { Message, ConversationState } from '../state/ConversationState.js';

export type ResponseType =
  | "question"
  | "hint"
  | "refusal"
  | "reflection";

export interface AgentMessage {
  role: 'assistant';
  content: string;
  type: ResponseType;
}

export interface AgentResponse {
  message: AgentMessage;
  stateUpdate?: Partial<ConversationState>; // Optional state modifications
}
