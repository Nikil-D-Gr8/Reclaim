import { useState } from 'react';
import { ModeSelection } from './components/ModeSelection';
import { ChatArea } from './components/ChatArea';
import { MessageInput } from './components/MessageInput';
import { Sidebar } from './components/Sidebar';
import { ProfileInsights } from './components/ProfileInsights';
import { useChat } from './hooks/useChat';
import type { ProfileSummary } from './types/api';
import { Menu, Plus } from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileViewActive, setProfileViewActive] = useState(false);
  const [summaries, setSummaries] = useState<ProfileSummary>({
    overallSummary: undefined,
    perMode: {
      writing: undefined,
      coding: undefined,
      math: undefined,
    },
    lastUpdated: undefined,
  });

  const {
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
  } = useChat();

  const handleSelectProfile = () => {
    setProfileViewActive(true);
    setSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string, mode: import('./types/api').Mode) => {
    selectPreviousSession(sessionId, mode);
    setProfileViewActive(false);
  };

  if (!selectedMode) {
    return <ModeSelection onSelectMode={startNewSession} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={deleteSession}
        onStartNewSession={startNewSession}
        onSelectProfile={handleSelectProfile}
        isProfileSelected={profileViewActive}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {profileViewActive ? 'Profile & Insights' : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
              </h1>
            </div>

            {!profileViewActive && (
              <button
                onClick={() => startNewSession(selectedMode)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {profileViewActive ? (
            <ProfileInsights summaries={summaries} />
          ) : (
            <>
              <ChatArea messages={messages} isLoading={isLoading} />
              <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
