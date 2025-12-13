# Reclaim - Frontend Implementation

A clean, minimal learning app that helps users think instead of outsourcing thinking to AI.

## Project Structure

```
src/
├── components/          # React UI components
│   ├── ModeSelection.tsx   # Initial mode selection screen
│   ├── Sidebar.tsx         # Left sidebar with chat history
│   ├── ConversationList.tsx# List of previous conversations
│   ├── ChatArea.tsx        # Message display with auto-scroll
│   ├── Message.tsx         # Individual message bubble
│   └── MessageInput.tsx    # Text input with send button
├── hooks/
│   └── useChat.ts          # Custom hook managing chat state
├── services/
│   ├── api.ts              # API service layer (calls backend)
│   └── README.md           # Complete API contract documentation
├── types/
│   └── api.ts              # TypeScript interfaces for all data types
├── App.tsx                 # Main app component
├── main.tsx                # App entry point
└── index.css               # Global styles and utilities
```

## Features

### Three Learning Modes
- **Writing** - For writing assistance and feedback
- **Coding** - For programming help and debugging
- **Math** - For mathematical problem solving

### User Flow
1. User lands on mode selection screen with three beautiful cards
2. Selects a learning mode to begin a conversation
3. New conversation starts automatically
4. Left sidebar shows all previous conversations for that mode
5. Can start new chats or resume previous ones using sidebar
6. Mode selection only happens at the start (no dropdown switching)

### Session Management
- Each mode maintains its own conversation history
- Multiple conversations per mode stored in sidebar
- Resume previous conversations by clicking in sidebar
- Delete conversations individually from sidebar
- "New Chat" button in header to start fresh conversations
- Sessions are fully isolated per mode

### UI/UX
- Beautiful mode selection screen with card-based UI
- Left sidebar with dark theme showing conversation history
- Hamburger menu on mobile to toggle sidebar visibility
- Clear visual distinction between user and assistant messages
- Loading state with animated dots
- Error state with prominent alert banner
- Auto-scrolling chat area
- Disabled input during loading
- Responsive design for mobile and desktop

## API Contract

The frontend expects three backend endpoints:

### POST /api/session/start
Initializes a new learning session for a specific mode.

### POST /api/message/send
Sends a user message and receives an AI response.

### GET /api/session/:id
Retrieves a complete session with all messages.

See `src/services/README.md` for complete API documentation.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Vite** - Build tool

## State Management

The app uses local React state only:
- `useChat` hook manages all chat state and session history
- Sessions stored in component state as arrays indexed by mode
- Tracks current selected mode and active session ID
- No external state management libraries
- Sidebar state managed separately for mobile/desktop toggle

## Backend Integration Points

The frontend is ready for backend integration:

1. Update `src/services/api.ts` with your actual backend URL
2. Implement the three API endpoints as documented
3. The frontend will automatically work with real data

## Running the Project

```bash
npm install
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

## Next Steps

1. Implement backend API endpoints
2. Add authentication if needed
3. Implement AI agents for each learning mode
4. Add data persistence with Supabase
5. Consider adding features like:
   - Session history/list view
   - Export conversations
   - User preferences
   - Markdown rendering for code blocks
