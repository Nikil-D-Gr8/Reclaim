import { VercelRequest, VercelResponse } from '@vercel/node';
import { SendMessageRequest, SendMessageResponse, Message } from '../../src/types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, mode, content }: SendMessageRequest = req.body;

  if (!sessionId || !mode || !content) {
    return res.status(400).json({ error: 'Session ID, mode, and content are required' });
  }

  const timestamp = Date.now();

  // Create user message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    timestamp,
  };

  // Create assistant message (placeholder)
  // No AI logic implemented yet
  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: 'This is a placeholder response from the backend.',
    timestamp: timestamp + 1, // slight offset for ordering
  };

  const response: SendMessageResponse = {
    message: userMessage,
    assistantMessage,
  };

  res.status(200).json(response);
}
