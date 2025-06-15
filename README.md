# meh-trics
<p></p>
Because being a chaotic goblin should still be a measurable lifestyle.
<P></P>
Catalog your moods, tasks, half-eaten ideas, and emotional potholes in a system that knows you’re trying — just not before coffee. A control panel for the barely-held-together.
<P></P>
<P></P>

This project is a productivity and wellbeing companion built with [Encore](https://encore.dev/) for the backend and React + Vite for the frontend.

- **Features**

### Mood Tracking
- Pulse Check – quick mood check‑ins with emoji tags and notes
- Editable Mood Options – manage your own set of moods and routine items
- Mood Entry Sort Index – faster `/mood-entries` queries via a composite index on date and creation time

### Journaling
- Moment Marker – create journal entries with optional date and Markdown
- Journal Templates – save common prompts for new entries
- Journal Date Index – faster `/journal-entries` queries via an index on entry dates
- Add Template Buttons – create routine or journal templates from their respective trackers

### Habits & Routines
- Routine Tracker – log recurring routine activities
- Habit Tracker – create habits and log individual entries
- Routine Templates – create reusable routine item sets

### Task Management
- Task Tracker – manage tasks with priorities, due dates and drag‑to‑reorder
- Quick Add – create tasks for today right from the Today page
- Bulk Actions – select multiple tasks or habits to complete, delete or reschedule
- Recurring Tasks – automatically generate tasks on a schedule
- Recurring Task Quotas – limit how often recurring tasks are generated
- Due Date Index – faster `/tasks/due` queries via a database index on task due dates
- Task Filter Indexes – faster `/tasks` filtering via indexes on status, energy level and tags

### Calendar & Search
- Calendar View – see events and entries on a calendar
- Global Search – press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> to search across tasks, habits and entries
- Keyboard Navigation – press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>1‑9</kbd> to jump to tabs or use <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>←</kbd>/<kbd>→</kbd> to cycle

### General
- Dark Mode – toggle between light and dark themes
- Customizable Layout – drag and drop dashboard widgets and navigation items
- Analytics Dashboard – view aggregate stats on your productivity
- Offline Support – installable PWA with cached assets for offline use
- Manual Offline Sync – trigger queued entries to sync when ready
- Data Export – download your entries as a CSV file

You can view this feature list inside the app on the Settings page.

## Project Structure

This project uses a **monorepo structure** powered by **Bun workspaces**, organizing the codebase into distinct but interconnected packages:

### Monorepo Layout
```
meh-trics/
├── package.json              # Root workspace configuration
├── bun.lock                  # Unified lockfile for all packages
├── backend/                  # Encore.dev API server
│   ├── package.json          # Backend dependencies
│   ├── task/                 # Task and routine services
│   ├── mood/                 # Mood entry service
│   ├── habits/               # Habit tracker service
│   ├── calendar/             # Calendar event service
│   └── ...                   # Other backend services
├── frontend/                 # React + Vite PWA
│   ├── package.json          # Frontend dependencies
│   ├── src/                  # React components and hooks
│   └── ...                   # Frontend assets
├── docs/                     # Project documentation
├── e2e/                      # Playwright end-to-end tests
└── scripts/                  # Build and maintenance scripts
```

### Package Management with Bun

**Bun workspaces** provide several key benefits:

1. **Unified Dependencies**: All packages share a single `bun.lock` file, ensuring consistent versions
2. **Cross-package Scripts**: Run commands across workspaces from the root
3. **Faster Installs**: Bun's speed + workspace deduplication = lightning-fast setup
4. **Shared Development Tools**: ESLint, TypeScript, Playwright configs work across all packages

### Workspace Configuration

The root `package.json` defines the workspace structure:

```json
{
  "workspaces": ["backend", "frontend"],
  "packageManager": "bun@1.0.0"
}
```

Each workspace (`backend/` and `frontend/`) has its own `package.json` with:
- **Workspace-specific dependencies** (React for frontend, Encore for backend)
- **Local scripts** (`dev`, `build`, `test`)
- **Package metadata** and configurations

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

