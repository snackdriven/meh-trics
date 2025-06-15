# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend Development
- **Start backend**: `cd backend && encore run` (starts at http://localhost:4000)
- **Generate frontend client**: `cd backend && encore gen client --target leap` (run after API changes)
- **View API metrics**: Visit http://localhost:4000/metrics while backend is running

### Frontend Development  
- **Start frontend**: `bun run dev:frontend` (from root, starts at http://localhost:5173)
- **Build frontend for backend static assets**: `cd backend && bun run build` (this backend script builds the frontend into `backend/frontend/dist`)

### Testing & Quality
- **Run tests**: `bun test` (run `bun install` first if missing dependencies)
- **Run E2E tests**: `bun run test:e2e` (Playwright end-to-end tests)
- **Run E2E tests with UI**: `bun run test:e2e:ui` (Playwright with UI mode)
- **Run E2E tests headed**: `bun run test:e2e:headed` (see browser during tests)
- **Debug E2E tests**: `bun run test:e2e:debug` (step through tests)
- **Install Playwright browsers**: `bun run playwright:install` (or `bunx playwright install`)
- **Lint & format**: `bun x biome check --apply .` (formats files and sorts imports)
- **Lint SQL**: `bun run lint:sql` (catches SQL mistakes in migrations)
- **Check migrations**: `bun run check:migrations` (ensures no duplicate migration numbers)

### Package Management
- **Install dependencies**: `bun install` (from root, installs for all workspaces)
- **Package manager**: This project uses Bun workspaces

## Architecture

This is a wellbeing/productivity app built with:
- **Backend**: Encore.dev framework with TypeScript
- **Frontend**: React + Vite with Tailwind CSS
- **Database**: PostgreSQL (managed by Encore)
- **Testing**: Vitest with jsdom environment

### Agent-Based Architecture
The backend is organized around modular "agents" that each own a domain:
- **TaskAgent**: Task creation, editing, scheduling, recurring tasks
- **HabitAgent**: Habit tracking, streaks, frequency management  
- **MoodAgent**: Mood check-ins with notes and visual indicators
- **JournalAgent**: Journal entries (quick or freeform, with Markdown support)
- **TaggingAgent**: Context-aware auto-tagging based on time/events
- **RoutineAgent**: Recurring task templates and lifecycle management
- **CalendarAgent**: Aggregates all entries into calendar/Today view
- **InsightAgent**: Analytics, trends, and behavioral suggestions

### Key Directories
- **backend/**: Encore services organized by agent domain
  - **task/**: Task management and routines
  - **mood/**: Mood tracking  
  - **habits/**: Habit tracking
  - **calendar/**: Calendar events and imports
  - **migrations/**: SQL migrations (numbered per service)
- **frontend/**: React app with generated API client
  - **components/**: UI components using Radix UI + Tailwind
  - **hooks/**: Custom hooks including offline support
  - **constants/**: App constants (features, moods, tags)

### Path Aliases (vitest.config.ts)
- `@/`: Points to frontend/
- `~backend/client`: Points to frontend/client (generated API client)
- `~backend`: Points to backend/

### API Client Usage
After backend changes, regenerate the client and import in React:
```ts
import backend from "~backend/client";
const result = await backend.task.yourEndpoint(params);
```

### Migration Management
- Update latest migration file when iterating locally (don't create new ones until deployed)
- Restart backend with `encore run` to apply pending migrations
- Each service has its own migrations/ directory with numbered files

### Offline Support
The frontend is a PWA with offline capabilities using IndexedDB for caching and queuing operations when offline.