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
  status?: 'active' | 'summarizing' | 'completed';
  kestraExecutionId?: string;
  kestraWebhookUrl?: string;
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

// Profile and Insights types
export interface ProfileSummary {
  overallSummary?: string;
  perMode: {
    writing?: string;
    coding?: string;
    math?: string;
  };
  lastUpdated?: number;
  recentPatterns?: RecentPattern[];
}

export interface GetProfileSummaryResponse {
  overallSummary?: string;
  summaries: {
    writing?: string;
    coding?: string;
    math?: string;
  };
  lastUpdated?: number;
}

export interface EndSessionRequest {
  sessionId: string;
  mode: Mode;
}

export interface EndSessionResponse {
  success: boolean;
}

// Kestra and Insights types
export interface SessionSummary {
  sessionId: string;
  mode: Mode;
  patternsObserved: string;
  strengths: string;
  weaknesses: string;
  createdAt: number;
}

export interface SubjectMetrics {
  mode: Mode;
  strengthsCorpus: string[];
  weaknessesCorpus: string[];
  aggregatedSummary: string;
  lastUpdated: number;
}

export interface RecentPattern {
  sessionId: string;
  mode: Mode;
  pattern: string;
  createdAt: number;
}
