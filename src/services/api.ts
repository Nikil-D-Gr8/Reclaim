import type {
  Mode,
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
};
