import type { Mode, Session } from '../types/api';
import { ConversationList } from './ConversationList';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Record<Mode, Session[]>;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string, mode: Mode) => void;
  onDeleteSession: (sessionId: string, mode: Mode) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:relative w-64 h-screen bg-gray-900 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden text-white hover:bg-gray-800 p-2 rounded"
        >
          <X size={24} />
        </button>

        <ConversationList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(sessionId, mode) => {
            onSelectSession(sessionId, mode);
            onClose();
          }}
          onDeleteSession={onDeleteSession}
        />
      </div>
    </>
  );
}
