// In-memory session store for conversation states
// NOTE: This is process-local and non-persistent. Sessions will be lost on server restart.

import { ConversationState } from './ConversationState';

class SessionStore {
  private sessions = new Map<string, ConversationState>();

  /**
   * Retrieves an existing session state
   */
  getSession(sessionId: string): ConversationState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Creates a new session with initial state
   */
  createSession(sessionId: string, mode: "coding" | "math" | "writing"): ConversationState {
    const initialState: ConversationState = {
      sessionId,
      mode,
      messages: [],
      attempts: 0,
      phase: "exploration",
    };

    this.sessions.set(sessionId, initialState);
    return initialState;
  }

  /**
   * Updates an existing session with partial state changes
   */
  updateSession(sessionId: string, partialState: Partial<ConversationState>): ConversationState | null {
    const existingState = this.sessions.get(sessionId);
    if (!existingState) {
      return null;
    }

    const updatedState = { ...existingState, ...partialState };
    this.sessions.set(sessionId, updatedState);
    return updatedState;
  }

  /**
   * Deletes a session (for cleanup)
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Gets all active session IDs (for debugging/monitoring)
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();
