import { VercelRequest, VercelResponse } from '@vercel/node';
import { SendMessageRequest, SendMessageResponse, Message } from '../../src/types/api';
import { randomUUID } from 'crypto';
import { sessionStore } from '../../dist/server/server/state/SessionStore.js';
import { inferIntentFromMessage, updatePhase } from '../../dist/server/server/state/ConversationState.js';
import { codingAgent } from '../../dist/server/server/agents/CodingAgent.js';
import { writingAgent } from '../../dist/server/server/agents/WritingAgent.js';
import { mathAgent } from '../../dist/server/server/agents/MathAgent.js';

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
  let state = await sessionStore.getSession(sessionId);
  if (!state) {
    console.log(`Creating new session: ${sessionId} for mode: ${mode}`);
    state = await sessionStore.createSession(sessionId, mode);
  } else {
    console.log(`Found existing session: ${sessionId} with ${state.messages.length} messages`);
  }

  // Create user message
  const userMessage: Message = {
    id: randomUUID(),
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
  await sessionStore.updateSession(sessionId, {
    attempts: newAttempts,
    lastIntent,
    phase: newPhase,
  });

  // Get updated state for agent
  const updatedState = await sessionStore.getSession(sessionId);

  // Select agent based on mode
  let agent;
  switch (mode) {
    case 'coding':
      agent = codingAgent;
      break;
    case 'writing':
      agent = writingAgent;
      break;
    case 'math':
      agent = mathAgent;
      break;
    default:
      return res.status(400).json({ error: 'Invalid mode' });
  }

  // Call agent to generate response
  const agentResponse = await agent.respond(updatedState);

  // Create assistant message from agent response
  const assistantMessage: Message = {
    id: randomUUID(),
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
    await sessionStore.updateSession(sessionId, agentResponse.stateUpdate);
  }

  const response: SendMessageResponse = {
    message: userMessage,
    assistantMessage,
  };

  res.status(200).json(response);
}
