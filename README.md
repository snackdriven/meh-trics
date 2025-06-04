# Task, Habit & Mood Tracker

This project is a productivity and wellbeing companion built with [Encore](https://encore.dev/) for the backend and React + Vite for the frontend. It lets you keep track of your daily tasks, habits, routines and moods in one place.

## Features

- **Pulse Check** – quick mood check‑ins with emoji tags and notes
- **Moment Marker** – daily journal prompts for recording events and reflections
- **Routine Tracker** – log recurring routine activities
- **Habit Tracker** – create habits and log individual entries
- **Task Tracker** – manage tasks with priorities, due dates and drag‑to‑reorder
- **Recurring Tasks** – automatically generate tasks on a schedule
- **Calendar View** – see events and entries on a calendar
- **Global Search** – press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>K</kbd> to search across tasks, habits and entries

## Getting Started

### Prerequisites
Install the Encore CLI which runs the local backend environment:

```bash
# macOS
brew install encoredev/tap/encore
# Linux
curl -L https://encore.dev/install.sh | bash
# Windows (PowerShell)
iwr https://encore.dev/install.ps1 | iex
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
npm install
npx vite dev
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

