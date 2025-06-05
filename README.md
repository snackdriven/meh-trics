# meh-trics

Because being a chaotic goblin is a measurable lifestyle.
Catalog your moods, tasks, half-eaten ideas, and emotional potholes in a system that knows you’re trying — just not before coffee. A control panel for the barely-held-together.


This project is a productivity and wellbeing companion built with [Encore](https://encore.dev/) for the backend and React + Vite for the frontend.

- **Pulse Check** – quick mood check‑ins with emoji tags and notes
- **Moment Marker** – daily journal prompts for recording events and reflections
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
- **Recurring Task Quotas** – limit how often recurring tasks are generated
- **Analytics Dashboard** – view aggregate stats on your productivity

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

### Running the Backend

```bash
cd backend
encore run
```

The API server will start and print a local URL (usually `http://localhost:4000`).

### Running the Frontend

```bash
cd frontend
bun install
bunx vite dev
```

The app will be available at `http://localhost:5173` (or the next free port).

### Generating the Frontend Client

If you make changes to the backend API, regenerate the TypeScript client used by the frontend:

```bash
cd backend
encore gen client --target leap
```

## Deployment
Check `DEVELOPMENT.md` for detailed deployment instructions, including how to deploy to Encore Cloud or self‑host using Docker.

