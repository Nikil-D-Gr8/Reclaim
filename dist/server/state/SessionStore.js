"use strict";
// In-memory session store for conversation states
// NOTE: This is process-local and non-persistent. Sessions will be lost on server restart.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = void 0;
class SessionStore {
    constructor() {
        this.sessions = new Map();
    }
    /**
     * Retrieves an existing session state
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Creates a new session with initial state
     */
    createSession(sessionId, mode) {
        const initialState = {
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
    updateSession(sessionId, partialState) {
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
    deleteSession(sessionId) {
        return this.sessions.delete(sessionId);
    }
    /**
     * Gets all active session IDs (for debugging/monitoring)
     */
    getActiveSessions() {
        return Array.from(this.sessions.keys());
    }
}
// Export singleton instance
exports.sessionStore = new SessionStore();
