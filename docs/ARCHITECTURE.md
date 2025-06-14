# Architecture Overview

This project consists of modular agents that coordinate different domains of the wellness app. Each agent is composable and can be overridden as the product evolves.

## Agents

- **TaskAgent** – handles task creation, editing, and scheduling logic.
- **HabitAgent** – tracks recurring habits, frequencies, and streaks.
- **MoodAgent** – captures mood check‑ins with optional notes.
- **JournalAgent** – logs quick or freeform journal entries.
- **TaggingAgent** – applies automatic context-based tags to entries.
- **RoutineAgent** – manages recurring task templates and scheduling.
- **CalendarAgent** – aggregates all entries into a scrollable calendar view.
- **InsightAgent** – analyzes data to surface trends and suggestions.

For the full agent definitions see [AGENTS.md](../AGENTS.md).
