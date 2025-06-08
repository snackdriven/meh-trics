# meh-trics
<p></p>
Because being a chaotic goblin should still be a measurable lifestyle.
<P></P>
Catalog your moods, tasks, half-eaten ideas, and emotional potholes in a system that knows you’re trying — just not before coffee. A control panel for the barely-held-together.
<P></P>
<P></P>

This project is a productivity and wellbeing companion built with [Encore](https://encore.dev/) for the backend and React + Vite for the frontend.

- **Pulse Check** – quick mood check‑ins with emoji tags and notes
- **Moment Marker** – create journal entries with optional date and Markdown
- **Routine Tracker** – log recurring routine activities
- **Habit Tracker** – create habits and log individual entries
- **Task Tracker** – manage tasks with priorities, due dates and drag‑to‑reorder
- **Bulk Actions** – select multiple tasks or habits to complete, delete or reschedule
- **Recurring Tasks** – automatically generate tasks on a schedule
- **Calendar View** – see events and entries on a calendar
- **Global Search** – press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> to search across tasks, habits and entries
- **Dark Mode** – toggle between light and dark themes
- **Customizable Layout** – drag and drop dashboard widgets and navigation items
- **Editable Mood Options** – manage your own set of moods and routine items
- **Routine Templates** – create reusable routine item sets
- **Journal Templates** – save common prompts for new entries
- **Recurring Task Quotas** – limit how often recurring tasks are generated
- **Analytics Dashboard** – view aggregate stats on your productivity
- **Due Date Index** – faster `/tasks/due` queries via a database index on task due dates
- **Task Filter Indexes** – faster `/tasks` filtering via indexes on status, energy level and tags
- **Journal Date Index** – faster `/journal-entries` queries via an index on entry dates
- **Offline Support** – installable PWA with cached assets for offline use
- **Add Template Buttons** – create routine or journal templates from their respective trackers

You can view this feature list inside the app on the Settings page.

## Folder Structure
- **backend/task/** – task, journal, mood and routine services
- **backend/habits/** – habit tracker service
- **backend/calendar/** – calendar event service
- **frontend/** – React app and generated API client
- **DEVELOPMENT.md** – environment setup and deployment guide
- **vitest.config.ts** – test configuration and path aliases

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
1. Add a new `.ts` file inside `backend/task`, `backend/habits`, or `backend/calendar`.
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
- **Lint & format**: run `bun x biome check .` and `bun x biome format .` before committing.
- **Lint SQL**: execute `bun run lint:sql` to catch common SQL mistakes in migrations.
- **Minimize migrations**: when iterating locally, update the latest migration file rather than creating a new one until the change is deployed. This keeps the history small and avoids unnecessary steps on new environments.
- **Run tests**: execute `bun run test` to make sure unit tests still pass. Run `bun install` beforehand to populate `node_modules`; missing dependencies will cause `vitest` to fail.

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

