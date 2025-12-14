import type { Message as MessageType } from '../types/api';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

/**
 * Render a chat message bubble that displays markdown-formatted content with role-based styling.
 *
 * The component aligns and styles the bubble based on the message's `role` (e.g., 'user' vs others)
 * and renders `message.content` as Markdown with custom styling for code blocks/inline code,
 * paragraphs, lists, blockquotes, and headings.
 *
 * @param message - The message object to display; its `role` controls alignment and bubble styling and its `content` is rendered as Markdown.
 * @returns The React element representing the styled chat message bubble.
 */
export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <div className="text-sm break-words prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const isBlockCode = match || (children && typeof children === 'string' && children.includes('\n'));

                if (isBlockCode) {
                  return (
                    <pre className="bg-gray-800 text-gray-100 rounded p-2 overflow-x-auto text-xs">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                } else {
                  return (
                    <code className="bg-gray-300 text-gray-800 px-1 py-0.5 rounded text-xs" {...props}>
                      {children}
                    </code>
                  );
                }
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-400 pl-4 italic mb-2">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}