// Session store with file-based persistence for development
// NOTE: In production, this should use a proper database

import { ConversationState } from './ConversationState.js';
import { promises as fs } from 'fs';
import path from 'path';

class SessionStore {
  private sessions = new Map<string, ConversationState>();
  private storageFile = path.join(process.cwd(), 'sessions.json');
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;

    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const sessionsData = JSON.parse(data);
      for (const [sessionId, state] of Object.entries(sessionsData)) {
        this.sessions.set(sessionId, state as ConversationState);
      }
    } catch (error) {
      // File doesn't exist or is corrupted, start with empty sessions
      console.log('No existing sessions file found, starting fresh');
    }

    this.initialized = true;
  }

  private async saveToFile() {
    try {
      const sessionsData = Object.fromEntries(this.sessions);
      await fs.writeFile(this.storageFile, JSON.stringify(sessionsData, null, 2));
    } catch (error) {
      console.error('Failed to save sessions to file:', error);
    }
  }

  /**
   * Retrieves an existing session state
   */
  async getSession(sessionId: string): Promise<ConversationState | undefined> {
    await this.ensureInitialized();
    const session = this.sessions.get(sessionId);
    console.log(`SessionStore.getSession: Looking for ${sessionId}, found: ${!!session}`);
    if (session) {
      console.log(`Session has ${session.messages.length} messages`);
    }
    return session;
  }

  /**
   * Creates a new session with initial state
   */
  async createSession(sessionId: string, mode: "coding" | "math" | "writing"): Promise<ConversationState> {
    await this.ensureInitialized();

    const initialState: ConversationState = {
      sessionId,
      mode,
      messages: [],
      attempts: 0,
      phase: "exploration",
    };

    this.sessions.set(sessionId, initialState);
    await this.saveToFile();
    return initialState;
  }

  /**
   * Updates an existing session with partial state changes
   */
  async updateSession(sessionId: string, partialState: Partial<ConversationState>): Promise<ConversationState | null> {
    await this.ensureInitialized();

    const existingState = this.sessions.get(sessionId);
    if (!existingState) {
      return null;
    }

    const updatedState = { ...existingState, ...partialState };
    this.sessions.set(sessionId, updatedState);
    await this.saveToFile();
    return updatedState;
  }

  /**
   * Deletes a session (for cleanup)
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();

    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      await this.saveToFile();
    }
    return deleted;
  }

  /**
   * Gets all active session IDs (for debugging/monitoring)
   */
  async getActiveSessions(): Promise<string[]> {
    await this.ensureInitialized();
    return Array.from(this.sessions.keys());
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();
