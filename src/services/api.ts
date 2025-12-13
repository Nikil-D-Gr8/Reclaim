import type {
  Mode,
  StartSessionRequest,
  StartSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetSessionResponse,
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
};
