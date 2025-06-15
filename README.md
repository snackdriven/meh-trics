# meh-trics

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)]()

> A productivity and wellbeing companion for tracking moods, habits, tasks, and journal entries. Because being a chaotic goblin should still be a measurable lifestyle.

## Features

- 📊 **Mood Tracking** - Quick check-ins with emoji tags and notes
- 📝 **Journaling** - Markdown-supported entries with templates
- ✅ **Task Management** - Priorities, due dates, and recurring tasks
- 🎯 **Habit Tracking** - Build streaks and track progress
- 📅 **Calendar View** - Unified timeline of all entries
- 🔍 **Global Search** - Find anything with `Ctrl/⌘+K`
- 📱 **PWA Support** - Installable with offline capabilities
- 🌙 **Dark Mode** - Easy on the eyes
- 📈 **Analytics** - Insights into your patterns

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) for package management
- [Encore CLI](https://encore.dev/) for backend development

```bash
# Install Encore CLI
brew install encoredev/tap/encore  # macOS
# or curl -L https://encore.dev/install.sh | bash  # Linux
```

### Installation

```bash
git clone https://github.com/yourusername/meh-trics.git
cd meh-trics
bun install
```

### Running the Application

```bash
# Start backend
cd backend && encore run

# Start frontend (in new terminal)
bun run dev

# Or run both concurrently
bun run dev:all
```

The app will be available at `http://localhost:5173` with the API at `http://localhost:4000`.

## Tech Stack

- **Backend**: [Encore.dev](https://encore.dev/) with TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **Package Manager**: Bun workspaces
- **Testing**: Vitest + Playwright

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed setup and workflow
- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [API Reference](docs/API.md) - Backend endpoints
- [Contributing](docs/CONTRIBUTING.md) - How to contribute

## Project Structure

```
meh-trics/
├── backend/           # Encore.dev API services
├── frontend/          # React + Vite PWA
├── docs/              # Documentation
├── e2e/               # Playwright tests
└── scripts/           # Build utilities
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and standards
- Submitting pull requests
- Reporting issues

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report Issues](https://github.com/yourusername/meh-trics/issues)
- 💬 [Discussions](https://github.com/yourusername/meh-trics/discussions)
- 📖 [Documentation](docs/)

### Available Scripts

From the **root directory**, you can run:

```bash
# Install all dependencies
bun install

# Development
bun run dev:backend          # Start Encore backend only
bun run dev:frontend         # Start Vite frontend only  
bun run dev:all             # Start both concurrently

# Building
bun run build               # Build both packages

# Testing
bun test                    # Run all unit tests
bun run test:e2e           # Run Playwright E2E tests

# Maintenance
bun run lint:sql           # Lint SQL migrations
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

## Getting Started

### Prerequisites
Install the Encore CLI which runs the local backend environment and ensure
[Bun](https://bun.sh/) is installed for managing dependencies (e.g. `curl -fsSL https://bun.sh/install | bash`):

```bash
# macOS
brew install encoredev/tap/encore
# Linux
curl -L https://encore.dev/install.sh | bash
# Windows (PowerShell)
iwr https://encore.dev/install.ps1 | iex
```

### Installing Dependencies
This repository uses Bun workspaces for both the backend and frontend. Run the following once from the repository root:

```bash
bun install
```
Whenever you pull new changes that add dependencies, run `bun install` again to
ensure all workspaces are up to date.

### Running the Backend

```bash
cd backend
encore run
```

The API server will start and print a local URL (usually `http://localhost:4000`).
With the server running you can open `http://localhost:4000/metrics` to see
timings for recent API calls. See [docs/METRICS.md](docs/METRICS.md) for more
details.

### Running the Frontend

Install dependencies from the repository root (one time after cloning):

```bash
bun install
```

The frontend expects a `VITE_CLIENT_TARGET` environment variable pointing to the
backend API. Copy `.env.development` to `.env` if you need to customize the
value. By default it uses `http://localhost:4000`:

```bash
cp frontend/.env.development frontend/.env
```
Edit the new `.env` file and set `VITE_CLIENT_TARGET` to your backend URL.

Then start the development server from the root with:

```bash
bun run dev
```

The app will be available at `http://localhost:5173` (or the next free port).

### Generating the Frontend Client

If you make changes to the backend API, regenerate the TypeScript client used by the frontend:

```bash
cd backend
encore gen client --target leap
```

## Development Workflow

### Creating a Backend Endpoint
1. Add a new `.ts` file inside `backend/task`, `backend/mood`, `backend/habits`, or `backend/calendar`.
2. Export a function annotated with `encore.service` to define the route.
3. Start the API server with `encore run` and verify the new endpoint.

### Regenerating the Frontend Client
After changing the API surface run:
```bash
cd backend
encore gen client --target leap
```
Commit the updated `frontend/client.ts` file.

### Updating the Frontend
Import the generated client in your React components:
```ts
import backend from "~backend/client";
const result = await backend.task.yourEndpoint(params);
// or backend.habits.yourEndpoint(params)
// or backend.calendar.yourEndpoint(params)
```
Use the result to update UI state.

### Importing Calendar Events
Upload an `.ics` file to import events into the calendar service:

```bash
curl -X POST \
  -H "Content-Type: text/calendar" \
  --data-binary @my-events.ics \
  http://localhost:4000/calendar-events/import
```

The endpoint responds with a JSON object describing how many events were
imported and how many were skipped due to duplicates.

## SQL Linting & Standard Practices
- **Lint & format**: run `bun x biome check --apply .` before committing to automatically format files and sort imports.
- **Lint SQL**: execute `bun run lint:sql` to catch common SQL mistakes in migrations.
- **Check migrations**: run `bun run check:migrations` to ensure migration numbers aren't duplicated within a service.
- **Minimize migrations**: when iterating locally, update the latest migration file rather than creating a new one until the change is deployed. This keeps the history small and avoids unnecessary steps on new environments.
- **Run tests**: execute `bun run test` to make sure unit tests still pass. Run `bun install` beforehand to populate `node_modules`; missing dependencies will cause `vitest` to fail.

### Troubleshooting
If you encounter errors like `column "archived_at" does not exist`, restart the
backend with `encore run` to apply any pending database migrations. Migrations
run automatically when the server starts, so be sure to restart after pulling
new changes.

## Deployment
Check `DEVELOPMENT.md` for detailed deployment instructions, including how to deploy to Encore Cloud or self‑host using Docker.

## Architecture Overview

The backend is organized around a collection of small "agents" that each own a domain of functionality:

- **TaskAgent** – tasks and scheduling logic
- **HabitAgent** – recurring habit tracking and streaks
- **MoodAgent** – mood check‑ins with notes
- **JournalAgent** – quick or freeform journal entries
- **TaggingAgent** – automatic context-aware tags
- **RoutineAgent** – recurring task templates
- **CalendarAgent** – aggregates entries into a calendar view
- **InsightAgent** – analyzes data for trends and suggestions

See [AGENTS.md](./AGENTS.md) for the full definitions. A more detailed walkthrough lives in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development

To run both backend and frontend concurrently:

```sh
bun run dev:all
```

## Environment Variables

Configuration is managed via environment variables. You can use a `.env` file in the project root. Example variables:

```
# .env
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/mehtrics
ENCORE_CACHE_TTL=600
# ...other variables...
```

- `PORT`: Port for the backend server.
- `DATABASE_URL`: Connection string for your database.
- `ENCORE_CACHE_TTL`: (Optional) Cache time-to-live for Encore analytics endpoints.

## Docker / Self-Hosting Example

For self-hosting with Docker, provide environment variables in your `docker-compose.yml` or Dockerfile:

```yaml
# docker-compose.yml
version: '3'
services:
  mehtrics-backend:
    image: your-backend-image
    environment:
      - PORT=3000
      - DATABASE_URL=postgres://user:pass@db:5432/mehtrics
      - ENCORE_CACHE_TTL=600
    # ...other config...
  mehtrics-frontend:
    image: your-frontend-image
    # ...other config...
```

## Encore Optimization

- **Caching:** Encore’s built-in caching can be enabled for analytics endpoints by using the `@cache` annotation or relevant Encore cache APIs.
- **Background Jobs:** For generating trends or heavy analytics, consider offloading to Encore background jobs for better performance and responsiveness

