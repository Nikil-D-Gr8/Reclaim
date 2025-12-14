# Contributing to Reclaim

Thank you for your interest in contributing to Reclaim! This document provides guidelines and instructions for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [Kestra Workflow Setup](#kestra-workflow-setup)
- [Running the Project](#running-the-project)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm or yarn** - Package manager (npm comes with Node.js)
- **Git** - Version control system
- **Google Cloud Account** - For Gemini API access
- **Supabase Account** - For database services
- **Kestra Instance** - For workflow orchestration (can be self-hosted or cloud)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/yourusername/reclaim.git
cd reclaim
```
3. Add the upstream remote:
```bash
git remote add upstream https://github.com/original-owner/reclaim.git
```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
# Build the entire project (frontend + server)
npm run build:all

# Or build components separately
npm run build        # Frontend only
npm run build:server # Backend only
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Google Gemini AI Configuration
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
GOOGLE_GEMINI_MODEL=gemini-2.5-flash

# Development server URL (Vercel dev runs on port 3000)
VERCEL_URL=http://localhost:3000

# Kestra Authentication
KESTRA_USERNAME=your_kestra_username
KESTRA_PASSWORD=your_kestra_password
```

### Obtaining API Keys

1. **Google Gemini API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

2. **Kestra Credentials**:
   - If using self-hosted Kestra, use your instance credentials
   - If using Kestra Cloud, create an account and get your credentials

3. **Supabase Setup** (if implementing database features):
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Add to environment variables if needed

## Kestra Workflow Setup

Reclaim uses Kestra for automated session summarization workflows. To set up the workflow:

1. **Access Kestra UI**: Log in to your Kestra instance
2. **Create Namespace**: Create a namespace called `company.team` (or your preferred namespace)
3. **Create Workflow**: Add a new workflow with the following YAML configuration:

```yaml
id: session_summary_simple
namespace: company.team

description: >
  Fast Gemini summarization without script containers.

triggers:
  - id: webhook
    key: session-summary-simple
    type: io.kestra.plugin.core.trigger.Webhook

tasks:
  - id: gemini_reflection
    type: io.kestra.plugin.core.http.Request
    method: POST
    uri: "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=YOUR_GEMINI_API_KEY_HERE"
    headers:
      Content-Type: application/json
    body: |
      {
        "contents": [
          {
            "role": "user",
            "parts": [
              {
                "text": "You are an educational reflection agent.\n\nAnalyze HOW the user learned based on the conversation below.\n\nReturn plain text ONLY with two sections:\n1. Patterns Observed\n2. Strengths and Weaknesses\n\nConversation:\n{{ trigger.body.conversation }}"
              }
            ]
          }
        ]
      }

  - id: log_summary
    type: io.kestra.plugin.core.log.Log
    message: |
      📦 SUMMARY_OUTPUT
      {{ outputs.gemini_reflection.body }}
```

**Important Notes**:
- Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key
- Ensure the namespace matches your Kestra setup
- The workflow listens for webhook triggers and processes conversation summaries

4. **Test the Workflow**: Send a test webhook to verify it's working

## Running the Project

### Development Mode

```bash
# Start the Vite development server
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Production Preview

```bash
# Build and preview production build
npm run build
npm run preview
```

### API Development

If working on API routes, you can use Vercel dev for local API testing:

```bash
npx vercel dev
```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Latest development changes
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Making Changes

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the code style guidelines

3. Test your changes locally

4. Commit your changes:
```bash
git add .
git commit -m "feat: add new feature description"
```

5. Push to your fork:
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request on GitHub

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components

- Use functional components with hooks
- Follow the component structure in existing files
- Use TypeScript interfaces for props
- Keep components small and focused

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Testing
- `chore` - Maintenance

## Testing

Currently, there are no automated tests. When adding tests:

1. Use Jest or Vitest for unit tests
2. Add integration tests for API endpoints
3. Test components with React Testing Library
4. Ensure all tests pass before submitting PR

## Submitting Changes

### Pull Request Process

1. Ensure your code follows the guidelines above
2. Update documentation if needed
3. Test thoroughly on different devices/browsers
4. Create a clear PR description explaining:
   - What changes were made
   - Why they were necessary
   - How to test the changes

### Review Process

- All PRs require review before merging
- Address review feedback promptly
- Keep PRs focused on single features/fixes
- Squash commits when merging

### Reporting Issues

When reporting bugs or requesting features:

- Use the GitHub issue templates
- Provide clear reproduction steps
- Include browser/OS information
- Add screenshots for UI issues

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Kestra Documentation](https://kestra.io/docs)
- [Supabase Docs](https://supabase.com/docs)

Thank you for contributing to Reclaim! 🚀
