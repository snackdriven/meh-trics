# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI Assistant Guide (Claude Code & MCP)

Quick reference for AI assistants working with the meh-trics codebase.

## Essential Commands

### Development Workflow
```bash
# Setup (run once)
npm install                    # Install all dependencies

# Development (daily workflow)
npm run dev                    # Start both backend + frontend
npm run dev:backend           # Backend only (localhost:4000)
npm run dev:frontend          # Frontend only (localhost:5173)

# After API changes
cd backend && encore gen client --target leap  # Regenerate frontend API client

# Testing
npm test                      # Unit tests
npm run test:e2e             # E2E tests
npm run test:e2e:ui          # E2E with Playwright UI

# Code Quality
npm run lint                 # Check for lint issues
npm run lint:fix             # Auto-fix lint issues
npm run lint:health          # Comprehensive lint health report
npm run pre-commit           # Pre-commit quality checks
npm run type-check           # TypeScript validation
npm run quality-gate         # Full quality gate (CI-ready)
```

### Package Management
```bash
# Root dependencies (shared dev tools)
npm install -D package-name

# Backend dependencies
npm install --prefix backend package-name

# Frontend dependencies  
npm install --prefix frontend package-name
```

## Architecture Quick Reference

### Tech Stack
- **Backend**: Encore.dev (TypeScript) at http://localhost:4000
- **Frontend**: React + Vite at http://localhost:5173
- **Database**: PostgreSQL (auto-managed by Encore)
- **Package Manager**: npm workspaces

### Agent-Based Services
```
backend/
├── task/        # TaskAgent - task management, recurring tasks
├── habits/      # HabitAgent - habit tracking, streaks
├── mood/        # MoodAgent - mood check-ins, notes
├── calendar/    # CalendarAgent - unified calendar view
└── migrations/  # SQL migrations (numbered per service)
```

### Path Aliases (for imports)
- `@/` → `frontend/`
- `~backend/client` → `frontend/client` (generated API client)
- `~backend` → `backend/`

## Common Patterns

### API Client Usage
```typescript
// After running: cd backend && encore gen client --target leap
import backend from "~backend/client";

// Use in React components
const tasks = await backend.task.list();
const newTask = await backend.task.create({ title: "Do something" });
```

### Theme System
```typescript
// Access theme context
import { useTheme } from '@/contexts/ThemeContext';

// Use CSS custom properties for theme-aware colors
<div className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)]">
```

### Error Handling
```typescript
import { createUserFriendlyError, apiCall } from '@/lib/errorHandling';

// Wrap API calls with user-friendly error handling
const result = await apiCall(
  () => backend.task.create(taskData),
  'creating task'
);
```

## Development Tips

### Database Migrations
- Migrations auto-run when starting Encore backend
- Update latest migration file during development (don't create new ones until deployed)
- Each service has its own migrations directory

### Offline Support
- Frontend is a PWA with IndexedDB caching
- Operations queue when offline and sync when reconnected

### File Watching
- Backend: `encore run` has built-in hot reload
- Frontend: Vite has built-in hot reload
- Both watch file changes automatically

## Troubleshooting

### Common Issues
```bash
# Dependencies not found
npm install

# Port conflicts (backend uses 4000, frontend uses 5173)
lsof -ti:4000 | xargs kill -9  # Kill process on port 4000

# Database migration errors
cd backend && encore run      # Restart backend to apply migrations

# API client out of sync
cd backend && encore gen client --target leap  # Regenerate client
```

### Playwright E2E Testing
```bash
# Install browsers (run once)
npx playwright install

# Run tests
npm run test:e2e              # Headless
npm run test:e2e:headed       # See browser
npm run test:e2e:ui           # Interactive mode
npm run test:e2e:debug        # Step-by-step debugging
```

## MCP Integration Notes

When using with Claude Code or MCP clients:
- Use natural language for E2E testing: "Navigate to tasks and create a high priority item"
- The app runs on dual ports: API (4000) + UI (5173)
- All agent services are independently testable via API endpoints
- See `README-PLAYWRIGHT-MCP.md` for detailed MCP testing examples

## Quick File Locations

- **Main config**: `package.json` (root), `playwright.config.ts`, `vite.config.ts`
- **API client**: `frontend/client.ts` (auto-generated)
- **Theme system**: `frontend/contexts/ThemeContext.tsx`
- **Constants**: `frontend/constants/` (moods, features, tags)
- **Migrations**: `backend/*/migrations/` (per service)