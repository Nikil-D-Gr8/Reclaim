import type { Session, Mode } from '../types/api';
import { MessageCircle, Trash2 } from 'lucide-react';

interface ConversationListProps {
  sessions: Record<Mode, Session[]>;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string, mode: Mode) => void;
  onDeleteSession: (sessionId: string, mode: Mode) => void;
}

const modeLabels: Record<Mode, string> = {
  writing: 'Writing',
  coding: 'Coding',
  math: 'Math',
};

export function ConversationList({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}: ConversationListProps) {
  const modes: Mode[] = ['writing', 'coding', 'math'];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {modes.map((mode) => (
          <div key={mode}>
            <div className="px-4 py-2 mt-4 text-xs font-semibold uppercase text-gray-400">
              {modeLabels[mode]}
            </div>

            {sessions[mode]?.length === 0 ? (
              <div className="px-4 py-2 text-xs text-gray-500">
                No conversations yet
              </div>
            ) : (
              sessions[mode]?.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(session.id, mode)}
                    className="flex-1 flex items-center space-x-2 text-left truncate"
                  >
                    <MessageCircle size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm">
                      {session.messages[0]?.content.substring(0, 30) ||
                        'Empty conversation'}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id, mode);
                    }}
                    className="ml-2 p-1 hover:bg-red-600 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        Start a new conversation to begin
      </div>
    </div>
  );
}
