# Reclaim

A clean, minimal learning app that helps users think instead of outsourcing thinking to AI. Reclaim provides three specialized learning modes—Writing, Coding, and Math—with intelligent AI agents that guide users through their learning journey while maintaining conversation history and session management.

## Features

### Three Learning Modes
- **Writing** - Personalized writing assistance and constructive feedback
- **Coding** - Programming help, debugging support, and code explanations
- **Math** - Step-by-step mathematical problem solving and concept clarification

### User Experience
- Beautiful mode selection screen with intuitive card-based interface
- Persistent conversation history with sidebar navigation
- Seamless session management with the ability to resume previous chats
- Responsive design optimized for both desktop and mobile devices
- Real-time AI responses with loading states and error handling

### Technical Highlights
- Isolated session management per learning mode
- Backend integration with specialized AI agents for each domain
- Workflow automation using Kestra for session summarization
- Database persistence with Supabase
- Modern React architecture with TypeScript for type safety

## Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Static type checking for reliability
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling system
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - Server-side runtime
- **Google Gemini AI** - Advanced language model for intelligent responses
- **Supabase** - PostgreSQL database with real-time capabilities
- **Kestra** - Workflow orchestration for automated processes
- **Vercel** - Serverless deployment platform

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Cloud account (for Gemini API)
- Supabase account
- Kestra instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reclaim.git
cd reclaim
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see CONTRIBUTING.md for details)

4. Start the development server:
```bash
npm run dev
```

## Usage

1. **Select a Learning Mode**: Choose between Writing, Coding, or Math from the initial screen
2. **Start Learning**: Begin a new conversation or resume from the sidebar
3. **Interact**: Send messages and receive AI-guided responses
4. **Manage Sessions**: View conversation history and start new chats as needed

### API Endpoints

The application provides RESTful API endpoints for session management and messaging:

- `POST /api/session/start` - Initialize new learning sessions
- `POST /api/message/send` - Send messages and receive AI responses
- `GET /api/session/:id` - Retrieve complete session data

See `src/services/README.md` for complete API documentation.

## Project Structure

```
├── api/                    # Vercel API routes
├── server/                 # Backend server code
│   ├── agents/            # AI agents for each learning mode
│   ├── llm/               # Language model integrations
│   └── state/             # State management
├── src/                   # Frontend React application
│   ├── components/        # UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service layer
│   └── types/            # TypeScript definitions
├── .env                   # Environment variables
└── package.json          # Project dependencies
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to set up your development environment, run tests, and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have questions or need help:
- Open an issue on GitHub
- Check the [Contributing Guide](CONTRIBUTING.md) for setup help
- Review the API documentation in `src/services/README.md`
