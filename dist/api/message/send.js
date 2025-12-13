"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const SessionStore_1 = require("../../dist/server/state/SessionStore");
const ConversationState_1 = require("../../dist/server/state/ConversationState");
const CodingAgent_1 = require("../../dist/server/agents/CodingAgent");
const WritingAgent_1 = require("../../dist/server/agents/WritingAgent");
const MathAgent_1 = require("../../dist/server/agents/MathAgent");
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { sessionId, mode, content } = req.body;
    if (!sessionId || !mode || !content) {
        return res.status(400).json({ error: 'Session ID, mode, and content are required' });
    }
    const timestamp = Date.now();
    // Fetch or create conversation state
    let state = SessionStore_1.sessionStore.getSession(sessionId);
    if (!state) {
        state = SessionStore_1.sessionStore.createSession(sessionId, mode);
    }
    // Create user message
    const userMessage = {
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
    const lastIntent = (0, ConversationState_1.inferIntentFromMessage)(content);
    const newPhase = (0, ConversationState_1.updatePhase)(newAttempts);
    // Update state
    SessionStore_1.sessionStore.updateSession(sessionId, {
        attempts: newAttempts,
        lastIntent,
        phase: newPhase,
    });
    // Get updated state for agent
    const updatedState = SessionStore_1.sessionStore.getSession(sessionId);
    // Select agent based on mode
    let agent;
    switch (mode) {
        case 'coding':
            agent = CodingAgent_1.codingAgent;
            break;
        case 'writing':
            agent = WritingAgent_1.writingAgent;
            break;
        case 'math':
            agent = MathAgent_1.mathAgent;
            break;
        default:
            return res.status(400).json({ error: 'Invalid mode' });
    }
    // Call agent to generate response
    const agentResponse = await agent.respond(updatedState);
    // Create assistant message from agent response
    const assistantMessage = {
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
        SessionStore_1.sessionStore.updateSession(sessionId, agentResponse.stateUpdate);
    }
    const response = {
        message: userMessage,
        assistantMessage,
    };
    res.status(200).json(response);
}
