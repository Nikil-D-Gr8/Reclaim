# API Contract Documentation

This document defines the backend API endpoints that the frontend expects to consume.

## Base URL
All endpoints are prefixed with `/api`

---

## Endpoints

### 1. Start Session
**Endpoint:** `POST /api/session/start`

**Purpose:** Initialize a new learning session for a specific mode (writing, coding, or math). Each mode maintains its own conversation history.

**Request Body:**
```typescript
{
  mode: 'writing' | 'coding' | 'math'
}
```

**Response:**
```typescript
{
  sessionId: string;        // Unique identifier for this session
  mode: 'writing' | 'coding' | 'math';
  createdAt: number;        // Unix timestamp
}
```

**Expected Behavior:**
- Create a new session in the database
- Return a unique session ID
- Associate the session with the specified mode

---

### 2. Send Message
**Endpoint:** `POST /api/message/send`

**Purpose:** Send a user message to the AI agent and receive a response. The backend should use the mode to determine which learning agent to engage (writing tutor, coding tutor, or math tutor).

**Request Body:**
```typescript
{
  sessionId: string;                    // Session to add message to
  mode: 'writing' | 'coding' | 'math';  // Current learning mode
  content: string;                      // User's message text
}
```

**Response:**
```typescript
{
  message: {
    id: string;
    role: 'user';
    content: string;
    timestamp: number;
  };
  assistantMessage: {
    id: string;
    role: 'assistant';
    content: string;
    timestamp: number;
  };
}
```

**Expected Behavior:**
- Validate session exists
- Store user message in database
- Process message through appropriate AI agent based on mode
- Generate and store AI response
- Return both messages to frontend

---

### 3. Get Session
**Endpoint:** `GET /api/session/:id`

**Purpose:** Retrieve a complete session including all messages. Useful for resuming conversations or syncing state.

**URL Parameters:**
- `id` - Session ID

**Response:**
```typescript
{
  session: {
    id: string;
    mode: 'writing' | 'coding' | 'math';
    messages: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      timestamp: number;
    }>;
    createdAt: number;
    updatedAt: number;
  }
}
```

**Expected Behavior:**
- Validate session exists
- Return complete session data including all messages in chronological order
- Return 404 if session not found

---

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `404` - Resource not found
- `500` - Server error

Error responses should follow this format:
```typescript
{
  error: string;  // Human-readable error message
}
```

---

## Notes for Backend Implementation

1. **Mode-specific agents:** The backend should maintain three separate AI agents/prompts for each learning mode
2. **Session persistence:** Sessions should be stored in a database (Supabase recommended)
3. **Message ordering:** Messages must maintain chronological order
4. **Concurrency:** Handle concurrent requests to the same session gracefully
5. **Rate limiting:** Consider implementing rate limits per session or user
