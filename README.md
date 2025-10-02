# AI Interview Coach

An AI-powered technical interview practice platform that provides realistic recruiter-like interactions with code-aware feedback.

## Overview

This project provides interactive technical interview practice with:
- Realistic recruiter-like interaction (voice, probing)
- Code-aware feedback by observing the session
- Local-first, free by default; optional OpenRouter integration

## Bootstrap Configuration

The project uses `docs/prd.json` and `docs/techstack.json` as the **source of truth** for:
- Features and requirements (PRD)
- Technology stack and architecture decisions
- Development roadmap and phases

### Loading Configuration

```javascript
import { bootstrap } from '@ai-interview-coach/shared/config';

// Load and validate all configurations
const config = bootstrap();
const { prd, techstack } = config;

// Access features (source of truth)
const features = prd.features;
const roadmap = prd.roadmap;

// Access tech stack (source of truth)  
const frontend = techstack.frontend;
const backend = techstack.backend;
const extension = techstack.extension;
```

### Configuration Structure

**PRD (`docs/prd.json`)**:
- Project goals and non-goals
- User personas
- Feature specifications with acceptance criteria
- Development roadmap
- User stories and risk assessments

**Tech Stack (`docs/techstack.json`)**:
- Monorepo configuration
- Frontend, backend, and extension tech choices
- Development phases and tooling
- Environment variables and permissions

## Project Structure

Based on the tech stack configuration:

```
ai-interviewer-coach/
├── apps/
│   ├── web/           # Next.js frontend
│   ├── relay/         # Backend API routes
│   └── extension/     # Chrome MV3 extension
├── packages/
│   └── shared/        # Shared types and utilities
├── docs/              # Source of truth configs
│   ├── prd.json       # Product Requirements Document
│   └── techstack.json # Technology Stack Definition
└── scripts/           # Development utilities
```

## Development Phases

1. **Phase 1**: Conversational MVP (Web) - Start/Stop + timer, STT + TTS, Local WebLLM loop
2. **Phase 2**: Screen Sharing - getDisplayMedia(), Preview + safe stop UI  
3. **Phase 3**: Extension (Code Awareness) - MV3 extension, Content script extraction
4. **Phase 4**: Feedback System - Rubric scoring, Markdown download
5. **Phase 5**: Model Settings - Local/Cloud toggle, API key input
6. **Phase 6**: Polish - Onboarding + privacy, Hotkeys, Local stats

## Getting Started

1. **Bootstrap Configuration**:
   ```bash
   # Build shared package
   cd packages/shared
   npm run build
   
   # Run bootstrap example
   cd scripts
   node bootstrap-example.js
   ```

2. **Development Setup**:
   ```bash
   # Install dependencies (using pnpm as configured)
   pnpm install
   
   # Start development servers
   pnpm dev
   ```

## Key Features

- **Session Management**: Start/stop interviews with timer and wrap-up
- **Voice Communication**: STT via Web Speech API; TTS via speechSynthesis
- **AI Interviewer Logic**: Protocol-driven interviewer with pacing and probing
- **Screen & Code Awareness**: Screen share MVP with extension for DOM extraction
- **Feedback & Reports**: End-of-session rubric and downloadable reports
- **Settings & Privacy**: Local/Cloud mode with privacy-first approach

## Technology Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API routes, Node.js runtime
- **Extension**: Chrome MV3 with Vite build
- **LLM**: Local WebLLM (Mistral 7B/8B) with OpenRouter cloud option
- **Speech**: Chrome Web Speech API + speechSynthesis
- **Monorepo**: pnpm workspaces

## Privacy & Security

- Local-first approach - nothing leaves your machine by default
- Optional cloud mode with BYO OpenRouter API key
- No server-side persistence for MVP
- Rate limiting on API endpoints

## License

MIT