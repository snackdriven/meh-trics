# meh-trics

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)]()

> A productivity and wellbeing companion for tracking moods, habits, tasks, and journal entries. Because being a chaotic goblin should still be a measurable lifestyle.

## Features

- 📊 **Mood Tracking** - Quick check-ins with emoji tags, intensity levels, and contextual notes
- 📝 **Journaling** - Rich markdown-supported entries with customizable templates and prompts
- ✅ **Task Management** - Full GTD-style system with priorities, due dates, contexts, and recurring tasks
- 🎯 **Habit Tracking** - Build streaks, track frequency, and monitor progress with visual indicators
- 📅 **Calendar View** - Unified timeline showing all entries, tasks, and habits in one place
- 🔍 **Global Search** - Find anything across all data types with `Ctrl/⌘+K` quick search
- 🏷️ **Smart Tagging** - Automatic context-aware tags and manual categorization
- 🔄 **Routine Templates** - Create and manage recurring task patterns and daily routines
- 📱 **PWA Support** - Installable progressive web app with offline capabilities
- 🌙 **Dark/Light Mode** - Automatic theme switching and user preference memory
- 📈 **Analytics & Insights** - Trend analysis, pattern recognition, and productivity insights
- 🎨 **Theme Customization** - Full color customization with live preview and export/import

## Tech Stack

- **Backend**: [Encore.dev](https://encore.dev/) with TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **Package Manager**: Bun workspaces
- **Testing**: Vitest + Playwright

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) for package management
- [Encore CLI](https://encore.dev/) for backend development

```bash
# Install Encore CLI
brew install encoredev/tap/encore  # macOS
curl -L https://encore.dev/install.sh | bash  # Linux
iwr https://encore.dev/install.ps1 | iex  # Windows (PowerShell)
```

### Installation & Running

```bash
git clone https://github.com/yourusername/meh-trics.git
cd meh-trics
bun install

# Start both backend and frontend
bun run dev
```

The app will be available at `http://localhost:5173` with the API at `http://localhost:4000`.

## Essential Commands

```bash
# Development
bun run dev                     # Start both backend and frontend
bun run dev:backend            # Start Encore backend only
bun run dev:frontend           # Start Vite frontend only

# Testing
bun test                       # Run all unit tests
bun run test:e2e              # Run Playwright E2E tests
bun run test:e2e:ui           # Run E2E tests with UI

# Building & Deployment
bun run build                 # Build both packages
bun run preview               # Preview production build

# Code Quality
bun run lint                  # Format and lint all code
bun run type-check            # TypeScript validation
```

## Architecture

The backend uses **agent-based architecture** with modular services:

- **TaskAgent** – Task management and scheduling
- **HabitAgent** – Habit tracking and streaks
- **MoodAgent** – Mood check-ins with notes
- **JournalAgent** – Journal entries and templates
- **CalendarAgent** – Unified calendar view
- **InsightAgent** – Analytics and trends

## Documentation

- 🚀 [Quick Development Guide](CLAUDE.md) - Essential commands and patterns for AI assistants
- 🏗️ [Architecture Overview](docs/ARCHITECTURE.md) - System design and agent structure
- 📚 [Complete Development Guide](docs/DEVELOPMENT.md) - Detailed setup and workflows
- 🎨 [Theme Customization](frontend/docs/THEME_CUSTOMIZATION.md) - Color and theme system
- 🧪 [Playwright MCP Integration](README-PLAYWRIGHT-MCP.md) - AI-driven testing setup
- 📦 [Workspace Guide](docs/WORKSPACE.md) - Monorepo and Bun workspace details

## License

MIT License - see [LICENSE](LICENSE) file for details.
bun run check:migrations   # Validate migration numbering
```

From **individual workspaces**, run package-specific commands:

```bash
# Backend workspace (backend/)
bun run dev                 # encore run with watch mode
bun test                   # Run backend tests
bun run type-check         # TypeScript checking

# Frontend workspace (frontend/)  
bun run dev                # Vite dev server
bun run build              # Production build
bun run preview            # Preview production build
```

### Why Bun + Workspaces?

- **⚡ Performance**: Bun installs packages ~20x faster than npm
- **🔄 Consistency**: Single lockfile prevents version conflicts
- **🛠️ Simplicity**: One `bun install` sets up the entire project
- **📦 Efficiency**: Shared dependencies reduce disk usage
- **🏗️ Scalability**: Easy to add new packages (mobile app, docs site, etc.)

## Development Workflow

### Creating a Backend Endpoint
1. Add a new `.ts` file inside `backend/task`, `backend/mood`, `backend/habits`, or `backend/calendar`
2. Export a function annotated with `encore.service` to define the route
3. Start the API server with `encore run` and verify the new endpoint

### Regenerating the Frontend Client
After changing the API surface:
```bash
cd backend
encore gen client --target leap
```

### Updating the Frontend
Import the generated client in your React components:
```ts
import backend from "~backend/client";
const result = await backend.task.yourEndpoint(params);
```

### Installing Dependencies
This repository uses Bun workspaces for both the backend and frontend. Run the following once from the repository root:

```bash
bun install
```
Whenever you pull new changes that add dependencies, run `bun install` again to
ensure all workspaces are up to date.

## Architecture Overview

The backend is organized around a collection of small "agents" that each own a domain of functionality:

- **TaskAgent** – tasks and scheduling logic
- **HabitAgent** – recurring habit tracking and streaks
- **MoodAgent** – mood check-ins with notes
- **JournalAgent** – quick or freeform journal entries
- **TaggingAgent** – automatic context-aware tags
- **RoutineAgent** – recurring task templates
- **CalendarAgent** – aggregates entries into a calendar view
- **InsightAgent** – analyzes data for trends and suggestions

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed setup and workflow
- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [API Reference](docs/API.md) - Backend endpoints

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report Issues](https://github.com/yourusername/meh-trics/issues)
- 💬 [Discussions](https://github.com/yourusername/meh-trics/discussions)
- 📖 [Documentation](docs/)

