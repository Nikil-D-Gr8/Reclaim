// Session store with file-based persistence for development
// NOTE: In production, this should use a proper database
import { promises as fs } from 'fs';
import path from 'path';
class SessionStore {
    constructor() {
        this.sessions = new Map();
        this.storageFile = path.join(process.cwd(), 'sessions.json');
        this.initialized = false;
    }
    async ensureInitialized() {
        if (this.initialized)
            return;
        try {
            const data = await fs.readFile(this.storageFile, 'utf8');
            const sessionsData = JSON.parse(data);
            for (const [sessionId, state] of Object.entries(sessionsData)) {
                this.sessions.set(sessionId, state);
            }
        }
        catch (error) {
            // File doesn't exist or is corrupted, start with empty sessions
            console.log('No existing sessions file found, starting fresh');
        }
        this.initialized = true;
    }
    async saveToFile() {
        try {
            const sessionsData = Object.fromEntries(this.sessions);
            await fs.writeFile(this.storageFile, JSON.stringify(sessionsData, null, 2));
        }
        catch (error) {
            console.error('Failed to save sessions to file:', error);
        }
    }
    /**
     * Retrieves an existing session state
     */
    async getSession(sessionId) {
        await this.ensureInitialized();
        return this.sessions.get(sessionId);
    }
    /**
     * Creates a new session with initial state
     */
    async createSession(sessionId, mode) {
        await this.ensureInitialized();
        const initialState = {
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
    async updateSession(sessionId, partialState) {
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
    async deleteSession(sessionId) {
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
    async getActiveSessions() {
        await this.ensureInitialized();
        return Array.from(this.sessions.keys());
    }
    /**
     * Gets session IDs by status
     */
    async getSessionsByStatus(status) {
        await this.ensureInitialized();
        const result = [];
        for (const [sessionId, session] of this.sessions) {
            if (session.status === status) {
                result.push(sessionId);
            }
        }
        return result;
    }
}
// Export singleton instance
export const sessionStore = new SessionStore();
