import { useState } from 'react';
import { Send, Square } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onEndSession?: () => void;
  disabled: boolean;
  canEndSession?: boolean;
  isEndingSession?: boolean;
}

export function MessageInput({
  onSendMessage,
  onEndSession,
  disabled,
  canEndSession = false,
  isEndingSession = false
}: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="max-w-4xl mx-auto flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled || isEndingSession}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onEndSession}
          disabled={!canEndSession || isEndingSession}
          className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          title="End conversation and generate learning summary"
        >
          <Square size={16} />
          <span className="hidden sm:inline">
            {isEndingSession ? 'Generating...' : 'End Conversation'}
          </span>
        </button>
        <button
          type="submit"
          disabled={disabled || !input.trim() || isEndingSession}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
      {isEndingSession && (
        <div className="max-w-4xl mx-auto mt-2 text-center">
          <p className="text-sm text-gray-600">Generating learning summary...</p>
        </div>
      )}
    </form>
  );
}
