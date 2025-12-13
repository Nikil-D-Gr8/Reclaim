import { VercelRequest, VercelResponse } from '@vercel/node';
import { SendMessageRequest, SendMessageResponse, Message } from '../../src/types/api';
import { sessionStore } from '../../server/state/SessionStore';
import { inferIntentFromMessage, updatePhase } from '../../server/state/ConversationState';
import { codingAgent } from '../../server/agents/CodingAgent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, mode, content }: SendMessageRequest = req.body;

  if (!sessionId || !mode || !content) {
    return res.status(400).json({ error: 'Session ID, mode, and content are required' });
  }

  const timestamp = Date.now();

  // Fetch or create conversation state
  let state = sessionStore.getSession(sessionId);
  if (!state) {
    state = sessionStore.createSession(sessionId, mode);
  }

  // Create user message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    timestamp,
  };

  // Append user message to state (with bounded array ~20 messages)
  state.messages.push(userMessage);
  if (state.messages.length > 20) {
    state.messages = state.messages.slice(-20);
  }

  // Increment attempts and update phase
  const newAttempts = state.attempts + 1;
  const lastIntent = inferIntentFromMessage(content);
  const newPhase = updatePhase(newAttempts);

  // Update state
  sessionStore.updateSession(sessionId, {
    attempts: newAttempts,
    lastIntent,
    phase: newPhase,
  });

  // Get updated state for agent
  const updatedState = sessionStore.getSession(sessionId)!;

  // Call agent to generate response
  const agentResponse = codingAgent.respond(updatedState);

  // Create assistant message from agent response
  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: agentResponse.message.content,
    timestamp: timestamp + 1, // slight offset for ordering
  };

  // Append assistant message to state
  updatedState.messages.push(assistantMessage);
  if (updatedState.messages.length > 20) {
    updatedState.messages = updatedState.messages.slice(-20);
  }

  // Apply any state updates from agent (if provided)
  if (agentResponse.stateUpdate) {
    sessionStore.updateSession(sessionId, agentResponse.stateUpdate);
  }

  const response: SendMessageResponse = {
    message: userMessage,
    assistantMessage,
  };

  res.status(200).json(response);
}
