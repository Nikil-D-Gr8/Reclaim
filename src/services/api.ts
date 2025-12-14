import type {
  Mode,
  Session,
  StartSessionRequest,
  StartSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetSessionResponse,
  GetProfileSummaryResponse,
  EndSessionRequest,
  EndSessionResponse,
} from '../types/api';

const API_BASE_URL = '/api';

export const apiService = {
  async startSession(mode: Mode): Promise<StartSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode } as StartSessionRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to start session');
    }

    return response.json();
  },

  async sendMessage(
    sessionId: string,
    mode: Mode,
    content: string
  ): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE_URL}/message/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, mode, content } as SendMessageRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  async getSession(sessionId: string): Promise<GetSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  },

  // API contract for fetching learning summaries generated asynchronously via Kestra
  // This will be implemented when backend is ready
  async getProfileSummary(): Promise<GetProfileSummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/profile/summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile summary');
    }

    return response.json();
  },

  // API contract for signaling session end - may trigger Kestra summarization
  // This will be implemented when backend is ready
  async endSession(sessionId: string, mode: Mode): Promise<EndSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/session/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, mode } as EndSessionRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to end session');
    }

    return response.json();
  },

  // API for processing Kestra results
  async processKestraResults(sessionId: string): Promise<{ status: 'processing' | 'completed', sessionSummary?: any }> {
    const response = await fetch(`${API_BASE_URL}/session/process-kestra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to process Kestra results');
    }

    return response.json();
  },

  // API for getting profile insights
  async getProfileInsights(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/insights`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile insights');
    }

    return response.json();
  },

  // API for getting all sessions
  async getAllSessions(): Promise<Session[]> {
    const response = await fetch(`${API_BASE_URL}/session/all`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all sessions');
    }

    const data = await response.json();
    return data.sessions;
  },

  // API for getting sessions that are currently being summarized
  async getSummarizingSessions(): Promise<{ sessions: Array<{ sessionId: string, mode: string, kestraExecutionId?: string }> }> {
    const response = await fetch(`${API_BASE_URL}/session/summarizing`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summarizing sessions');
    }

    return response.json();
  },
};
