import { useState, useCallback } from 'react';
import type { Mode, Message, Session } from '../types/api';
import { apiService } from '../services/api';

export function useChat() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Record<Mode, Session[]>>({
    writing: [],
    coding: [],
    math: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSession =
    selectedMode && currentSessionId
      ? sessions[selectedMode].find((s) => s.id === currentSessionId)
      : null;
  const messages = currentSession?.messages || [];

  const startNewSession = useCallback(async (mode: Mode) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement backend API call when backend is ready
      // For now, create a local session for UI development
      const sessionId = `session-${Date.now()}`;
      const createdAt = Date.now();

      // const response = await apiService.startSession(mode);

      const newSession: Session = {
        id: sessionId,
        mode: mode,
        messages: [],
        createdAt: createdAt,
        updatedAt: createdAt,
      };

      setSessions((prev) => ({
        ...prev,
        [mode]: [newSession, ...prev[mode]],
      }));

      setSelectedMode(mode);
      setCurrentSessionId(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectPreviousSession = useCallback((sessionId: string, mode: Mode) => {
    setSelectedMode(mode);
    setCurrentSessionId(sessionId);
    setError(null);
  }, []);

  const deleteSession = useCallback((sessionId: string, mode: Mode) => {
    setSessions((prev) => ({
      ...prev,
      [mode]: prev[mode].filter((s) => s.id !== sessionId),
    }));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setSelectedMode(null);
    }
  }, [currentSessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentSession || !selectedMode) {
        setError('No active session');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.sendMessage(
          currentSession.id,
          selectedMode,
          content
        );

        // Update session with the new messages from the API response
        setSessions((prev) => ({
          ...prev,
          [selectedMode]: prev[selectedMode].map((s) =>
            s.id === currentSession.id
              ? {
                  ...s,
                  messages: [...s.messages, response.message, response.assistantMessage],
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, selectedMode]
  );

  return {
    selectedMode,
    currentSessionId,
    sessions,
    messages,
    isLoading,
    error,
    startNewSession,
    selectPreviousSession,
    deleteSession,
    sendMessage,
  };
}
