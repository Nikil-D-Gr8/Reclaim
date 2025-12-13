export type Mode = 'writing' | 'coding' | 'math';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  mode: Mode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface StartSessionRequest {
  mode: Mode;
}

export interface StartSessionResponse {
  sessionId: string;
  mode: Mode;
  createdAt: number;
}

export interface SendMessageRequest {
  sessionId: string;
  mode: Mode;
  content: string;
}

export interface SendMessageResponse {
  message: Message;
  assistantMessage: Message;
}

export interface GetSessionResponse {
  session: Session;
}
